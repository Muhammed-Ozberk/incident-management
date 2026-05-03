import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const apiUrl = process.env.API_URL ?? 'http://localhost:3001';
const intervalMs = Number(process.env.SIMULATOR_INTERVAL_MS ?? 5_000);

const severities = ['low', 'medium', 'high', 'critical'] as const;

interface SimulatorTemplate {
  title: string;
  description: string;
}

interface SimulatorData {
  services: string[];
  templates: SimulatorTemplate[];
  impactStatements: string[];
}

interface RegisteredService {
  id: string;
  name: string;
}

const simulatorData = loadSimulatorData();
let registeredServices: RegisteredService[] = [];

async function main() {
  console.log(
    `Incident simulator is posting to ${apiUrl}/incidents every ${intervalMs}ms`,
  );

  registeredServices = await fetchRegisteredServices();

  await postRandomIncident();
  setInterval(postRandomIncident, intervalMs);
}

async function postRandomIncident() {
  const template = pick(simulatorData.templates);
  const service = pick(registeredServices);
  const payload = {
    title: `${template.title} #${randomNumber(100, 999)}`,
    description: `${template.description} ${pick(simulatorData.impactStatements)}`,
    serviceId: service.id,
    severity: weightedSeverity(),
  };

  try {
    const response = await fetch(`${apiUrl}/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${body}`);
    }

    const result = await response.json();
    const incident = result.data;
    console.log(
      `[${new Date().toISOString()}] ${incident.severity.toUpperCase()} ${incident.service.name} - ${incident.title}`,
    );
  } catch (error) {
    console.error('Failed to create simulated incident', error);
  }
}

async function fetchRegisteredServices(): Promise<RegisteredService[]> {
  const response = await fetch(`${apiUrl}/services`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Could not load services: ${response.status} ${response.statusText}: ${body}`);
  }

  const result = await response.json();
  const services = result.data as RegisteredService[];

  if (services.length === 0) {
    throw new Error('No registered services found. Run the seed command first.');
  }

  return services;
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function weightedSeverity() {
  const roll = Math.random();

  if (roll < 0.35) return 'low';
  if (roll < 0.65) return 'medium';
  if (roll < 0.9) return 'high';
  return 'critical';
}

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function loadSimulatorData(): SimulatorData {
  const path = join(__dirname, 'data', 'incident-simulator-data.json');
  const rawData = readFileSync(path, 'utf8');
  const parsedData = JSON.parse(rawData) as SimulatorData;

  if (
    parsedData.services.length === 0 ||
    parsedData.templates.length === 0 ||
    parsedData.impactStatements.length === 0
  ) {
    throw new Error('Simulator data must include services, templates, and impactStatements.');
  }

  return parsedData;
}

void main();

export {};
