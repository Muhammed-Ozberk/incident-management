import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DashboardHeader } from '../features/incidents/components/dashboard-header';
import { IncidentDetailModal } from '../features/incidents/components/incident-detail-modal';
import { IncidentFilters } from '../features/incidents/components/incident-filters';
import { IncidentFormModal } from '../features/incidents/components/incident-form-modal';
import { IncidentHistoryModal } from '../features/incidents/components/incident-history-modal';
import { IncidentList } from '../features/incidents/components/incident-list';
import { IncidentPagination } from '../features/incidents/components/incident-pagination';
import { IncidentSummaryModal } from '../features/incidents/components/incident-summary-modal';
import { useIncidents } from '../features/incidents/hooks/use-incidents';
import { incidentsApi } from '../features/incidents/api/incidents-api';
import { servicesApi } from '../features/services/api/services-api';
import { ToastStack } from '../components/toast-stack';
import type {
  AuditLog,
  CreateIncidentPayload,
  Incident,
  RegisteredService,
} from '../features/incidents/types/incident';

export function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [selectedIncidentDetail, setSelectedIncidentDetail] =
    useState<Incident | null>(null);
  const [selectedIncidentLogs, setSelectedIncidentLogs] = useState<{
    title: string;
    logs: AuditLog[];
  } | null>(null);
  const [selectedIncidentSummary, setSelectedIncidentSummary] = useState<{
    incident: Incident;
    summary: string;
    generated: boolean;
  } | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [services, setServices] = useState<RegisteredService[]>([]);
  const {
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
    refresh,
    dismissNotification,
    createIncident,
    updateIncident,
    deleteIncident,
  } = useIncidents();

  useEffect(() => {
    let isMounted = true;

    servicesApi
      .list()
      .then((response) => {
        if (isMounted) {
          setServices(response.data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch services', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreate(payload: CreateIncidentPayload) {
    await createIncident(payload);
    setIsCreateModalOpen(false);
  }

  async function handleUpdate(payload: CreateIncidentPayload) {
    if (!editingIncident) return;
    await updateIncident(editingIncident.id, payload);
    setEditingIncident(null);
  }

  async function handleViewLogs(id: string) {
    setIsLoadingLogs(true);
    try {
      const response = await incidentsApi.getById(id);
      setSelectedIncidentLogs({
        title: response.data.title,
        logs: response.data.logs ?? [],
      });
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setIsLoadingLogs(false);
    }
  }

  async function handleViewSummary(incident: Incident, regenerate = false) {
    if (incident.summary && !regenerate) {
      setSelectedIncidentSummary({
        incident,
        summary: incident.summary,
        generated: false,
      });
      return;
    }

    setSelectedIncidentSummary((current) => ({
      incident,
      summary: current?.incident.id === incident.id ? current.summary : '',
      generated: false,
    }));
    setIsLoadingSummary(true);

    try {
      const response = await incidentsApi.getAiSummary(incident.id, regenerate);
      setSelectedIncidentSummary({
        incident: {
          ...incident,
          summary: response.data.summary,
        },
        summary: response.data.summary,
        generated: response.data.generated,
      });
      refresh();
    } catch (err) {
      console.error('Failed to generate summary', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <ToastStack
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      <DashboardHeader
        stats={stats}
        realtimeConnected={realtimeConnected}
        onRefresh={refresh}
        onCreate={() => setIsCreateModalOpen(true)}
      />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <IncidentFilters
            query={query}
            services={services}
            onChange={setQuery}
          />

          <IncidentList
            incidents={incidents}
            loading={loading}
            error={error}
            highlightedIds={highlightedIds}
            onStatusChange={(id, status) => updateIncident(id, { status })}
            onDelete={deleteIncident}
            onEdit={setEditingIncident}
            onViewLogs={handleViewLogs}
            onViewSummary={handleViewSummary}
            onViewDetails={setSelectedIncidentDetail}
          />

          <IncidentPagination
            meta={meta}
            limit={query.limit}
            onChange={setQuery}
          />
        </div>
      </section>

      {isCreateModalOpen && (
        <IncidentFormModal
          ariaLabel="Create incident"
          closeLabel="Close create incident modal"
          services={services}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {editingIncident && (
        <IncidentFormModal
          ariaLabel="Edit incident"
          closeLabel="Close edit incident modal"
          services={services}
          initialData={{
            title: editingIncident.title,
            description: editingIncident.description,
            serviceId: editingIncident.serviceId,
            severity: editingIncident.severity,
          }}
          onClose={() => setEditingIncident(null)}
          onSubmit={handleUpdate}
        />
      )}

      {selectedIncidentDetail && (
        <IncidentDetailModal
          incident={selectedIncidentDetail}
          onClose={() => setSelectedIncidentDetail(null)}
          onEdit={() => {
            setEditingIncident(selectedIncidentDetail);
            setSelectedIncidentDetail(null);
          }}
        />
      )}

      {selectedIncidentLogs && (
        <IncidentHistoryModal
          title={selectedIncidentLogs.title}
          logs={selectedIncidentLogs.logs}
          onClose={() => setSelectedIncidentLogs(null)}
        />
      )}

      {selectedIncidentSummary && (
        <IncidentSummaryModal
          incident={selectedIncidentSummary.incident}
          summary={selectedIncidentSummary.summary}
          generated={selectedIncidentSummary.generated}
          loading={isLoadingSummary}
          onClose={() => setSelectedIncidentSummary(null)}
          onRegenerate={() =>
            handleViewSummary(selectedIncidentSummary.incident, true)
          }
        />
      )}

      {(isLoadingLogs || (isLoadingSummary && selectedIncidentSummary?.summary)) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
            <RefreshCw className="animate-spin text-slate-900" size={24} />
          </div>
        </div>
      )}
    </main>
  );
}
