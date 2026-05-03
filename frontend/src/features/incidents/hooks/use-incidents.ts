import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { ToastNotification } from '../../../components/toast-stack';
import { incidentsApi } from '../api/incidents-api';
import {
  INCIDENT_CREATED_EVENT,
  INCIDENT_DELETED_EVENT,
  INCIDENT_UPDATED_EVENT,
} from '../realtime/incident-events';
import type {
  CreateIncidentPayload,
  Incident,
  IncidentQuery,
  IncidentStats,
  PaginationMeta,
  UpdateIncidentPayload,
} from '../types/incident';

const socketUrl = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001';

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

const defaultStats: IncidentStats = {
  total: 0,
  open: 0,
  critical: 0,
  investigating: 0,
};

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [stats, setStats] = useState<IncidentStats>(defaultStats);
  const [query, setQueryState] = useState<IncidentQuery>({
    page: 1,
    limit: 10,
    status: '',
    severity: '',
    service: '',
    serviceId: '',
    order: 'desc',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const queryRef = useRef(query);
  const pendingLocalCreatesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const setQuery = useCallback((patch: Partial<IncidentQuery>) => {
    setQueryState((current) => ({
      ...current,
      ...patch,
    }));
  }, []);

  const markHighlighted = useCallback((id: string) => {
    setHighlightedIds((current) => new Set(current).add(id));
    window.setTimeout(() => {
      setHighlightedIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }, 1400);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }, []);

  const pushNotification = useCallback(
    (notification: Omit<ToastNotification, 'id'>) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setNotifications((current) => [
        { id, ...notification },
        ...current.slice(0, 3),
      ]);

      window.setTimeout(() => {
        dismissNotification(id);
      }, 3000);
    },
    [dismissNotification],
  );

  const addOrUpdateIncident = useCallback(
    (incident: Incident, incrementTotalWhenNew: boolean) => {
      setIncidents((current) => {
        const exists = current.some((item) => item.id === incident.id);

        if (exists) {
          return current.map((item) =>
            item.id === incident.id ? incident : item,
          );
        }

        if (incrementTotalWhenNew) {
          setMeta((metaCurrent) => ({
            ...metaCurrent,
            total: metaCurrent.total + 1,
            totalPages: Math.max(
              1,
              Math.ceil((metaCurrent.total + 1) / queryRef.current.limit),
            ),
          }));
        }

        return [incident, ...current].slice(0, queryRef.current.limit);
      });
    },
    [],
  );

  const removeIncident = useCallback((id: string) => {
    setIncidents((current) => {
      const exists = current.some((incident) => incident.id === id);

      if (!exists) {
        return current;
      }

      setMeta((metaCurrent) => ({
        ...metaCurrent,
        total: Math.max(0, metaCurrent.total - 1),
        totalPages: Math.max(
          0,
          Math.ceil(Math.max(0, metaCurrent.total - 1) / queryRef.current.limit),
        ),
      }));

      return current.filter((incident) => incident.id !== id);
    });
  }, []);

  const removeIncidentIfPresent = useCallback((id: string, current: Incident[]) => {
    const exists = current.some((incident) => incident.id === id);

    if (exists) {
      setMeta((metaCurrent) => ({
        ...metaCurrent,
        total: Math.max(0, metaCurrent.total - 1),
        totalPages: Math.max(
          0,
          Math.ceil(Math.max(0, metaCurrent.total - 1) / queryRef.current.limit),
        ),
      }));
    }

    return current.filter((incident) => incident.id !== id);
  }, []);

  const fetchIncidents = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        const [incidentsRes, statsRes] = await Promise.all([
          incidentsApi.list(queryRef.current, signal),
          incidentsApi.getStats(),
        ]);
        if (incidentsRes.data) {
          setIncidents(incidentsRes.data.items || []);
          if (incidentsRes.data.meta) {
            setMeta(incidentsRes.data.meta);
          }
        }
        
        if (statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load incidents');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchStats = useCallback(async () => {
    try {
      const response = await incidentsApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchIncidents(controller.signal);
    return () => controller.abort();
  }, [fetchIncidents, query]);

  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socket.on('connect', () => setRealtimeConnected(true));
    socket.on('disconnect', () => setRealtimeConnected(false));
    socket.on('connect_error', () => setRealtimeConnected(false));
    socket.io.on('reconnect_attempt', () => setRealtimeConnected(false));

    socket.on(INCIDENT_CREATED_EVENT, (incident: Incident) => {
      const localSignature = createSignature(incident);
      const isLocalCreate = pendingLocalCreatesRef.current.has(localSignature);

      if (isLocalCreate) {
        pendingLocalCreatesRef.current.delete(localSignature);
      } else {
        pushNotification({
          type: 'info',
          title: 'New incident received',
          description: `${incident.service.name} - ${incident.title}`,
        });
      }

      if (!matchesQuery(incident, queryRef.current)) {
        return;
      }

      markHighlighted(incident.id);
      addOrUpdateIncident(incident, true);
      void fetchStats();
    });

    socket.on(INCIDENT_UPDATED_EVENT, (incident: Incident) => {
      markHighlighted(incident.id);
      setIncidents((current) => {
        const shouldShow = matchesQuery(incident, queryRef.current);
        const exists = current.some((item) => item.id === incident.id);

        if (!shouldShow) {
          return removeIncidentIfPresent(incident.id, current);
        }

        if (!exists && queryRef.current.page === 1) {
          return [incident, ...current].slice(0, queryRef.current.limit);
        }

        return current.map((item) => (item.id === incident.id ? incident : item));
      });
      void fetchStats();
    });

    socket.on(INCIDENT_DELETED_EVENT, ({ id }: { id: string }) => {
      removeIncident(id);
      void fetchStats();
    });

    return () => {
      socket.disconnect();
    };
  }, [
    addOrUpdateIncident,
    fetchStats,
    markHighlighted,
    pushNotification,
    removeIncident,
    removeIncidentIfPresent,
  ]);

  const createIncident = useCallback(
    async (payload: CreateIncidentPayload) => {
      pendingLocalCreatesRef.current.add(createSignature(payload));
      try {
        const response = await incidentsApi.create(payload);
        pushNotification({
          type: 'success',
          title: 'Incident created',
          description: `${response.data.service.name} - ${response.data.title}`,
        });

        if (matchesQuery(response.data, queryRef.current)) {
          markHighlighted(response.data.id);
          addOrUpdateIncident(response.data, true);
          void fetchStats();
        }
      } catch (err) {
        pendingLocalCreatesRef.current.delete(createSignature(payload));
        throw err;
      }
    },
    [addOrUpdateIncident, fetchStats, markHighlighted, pushNotification],
  );

  const updateIncident = useCallback(
    async (id: string, payload: UpdateIncidentPayload) => {
      const originalIncidents = [...incidents];
      const originalStats = { ...stats };
      const incidentToUpdate = incidents.find((i) => i.id === id);

      if (!incidentToUpdate) return;

      // Optimistic Update
      const updatedIncident = { ...incidentToUpdate, ...payload };
      const shouldStillShow = matchesQuery(updatedIncident, queryRef.current);

      setIncidents((current) =>
        shouldStillShow
          ? current.map((i) => (i.id === id ? updatedIncident : i))
          : current.filter((i) => i.id !== id),
      );

      // Simple optimistic stats update (optional but nice)
      if (payload.status || payload.severity) {
        setStats((current) => {
          const next = { ...current };
          // This is a simplified stats update, real one comes from server
          if (payload.status === 'open' && incidentToUpdate.status !== 'open')
            next.open++;
          if (payload.status !== 'open' && incidentToUpdate.status === 'open')
            next.open--;
          return next;
        });
      }

      try {
        const response = await incidentsApi.update(id, payload);
        markHighlighted(id);
        // Sync with actual server data
        setIncidents((current) =>
          matchesQuery(response.data, queryRef.current)
            ? current.map((i) => (i.id === id ? response.data : i))
            : current.filter((i) => i.id !== id),
        );
        void fetchStats();
      } catch (err) {
        setIncidents(originalIncidents);
        setStats(originalStats);
        pushNotification({
          type: 'error',
          title: 'Update failed',
          description: 'Could not update incident. Rolling back changes.',
        });
        throw err;
      }
    },
    [
      incidents,
      stats,
      fetchStats,
      markHighlighted,
      pushNotification,
      removeIncidentIfPresent,
    ],
  );

  const deleteIncident = useCallback(
    async (id: string) => {
      const originalIncidents = [...incidents];
      const originalMeta = { ...meta };
      const originalStats = { ...stats };

      // Optimistic Update
      removeIncident(id);

      try {
        await incidentsApi.remove(id);
        pushNotification({
          type: 'info',
          title: 'Incident deleted',
          description: 'The incident has been removed.',
        });
        void fetchStats();
      } catch (err) {
        // Rollback
        setIncidents(originalIncidents);
        setMeta(originalMeta);
        setStats(originalStats);
        pushNotification({
          type: 'error',
          title: 'Delete failed',
          description: 'Could not delete incident. Rolling back.',
        });
      }
    },
    [incidents, meta, stats, removeIncident, fetchStats, pushNotification],
  );

  return useMemo(
    () => ({
      incidents,
      meta,
      stats,
      query,
      loading,
      error,
      realtimeConnected,
      highlightedIds,
      notifications,
      setQuery,
      refresh: () => fetchIncidents(),
      fetchStats,
      dismissNotification,
      createIncident,
      updateIncident,
      deleteIncident,
    }),
    [
      incidents,
      meta,
      stats,
      query,
      loading,
      error,
      realtimeConnected,
      highlightedIds,
      notifications,
      setQuery,
      fetchIncidents,
      fetchStats,
      dismissNotification,
      createIncident,
      updateIncident,
      deleteIncident,
    ],
  );
}

function matchesQuery(incident: Incident, query: IncidentQuery) {
  if (query.status && incident.status !== query.status) return false;
  if (query.severity && incident.severity !== query.severity) return false;
  if (query.serviceId && incident.serviceId !== query.serviceId) return false;
  if (
    query.service?.trim() &&
    !incident.service.name.toLowerCase().includes(query.service.trim().toLowerCase())
  ) {
    return false;
  }

  return true;
}

function createSignature({
  title,
  description,
  serviceId,
  severity,
}: Pick<Incident, 'title' | 'description' | 'serviceId' | 'severity'>) {
  return [title, description, serviceId, severity].join('|');
}
