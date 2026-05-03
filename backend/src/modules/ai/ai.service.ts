import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI, Type } from '@google/genai';
import { IncidentSeverity } from '../incidents/domain/incident.enums';
import { Service } from '../services/domain/service.types';

export interface IncidentAiSuggestion {
  severity: IncidentSeverity;
  serviceId: string;
  serviceName: string;
  reasoning: string;
}

export interface IncidentAiSummary {
  summary: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly genAI: GoogleGenAI;
  private readonly apiKey: string;
  private readonly modelPool: string[];

  constructor(private readonly configService: ConfigService) {
    this.apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      '';
    const configuredModel =
      this.configService.get<string>('GOOGLE_AI_MODEL') || 'gemini-2.5-flash';
    this.modelPool = Array.from(
      new Set([
        configuredModel,
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.5-pro',
        'gemini-flash-latest',
      ]),
    );
    this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async suggestIncidentDetails(
    title: string,
    description: string,
    services: Service[] = [],
  ): Promise<IncidentAiSuggestion> {
    const lang = this.detectLanguage(`${title} ${description}`);

    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY is not defined. Returning heuristic suggestion.');
      const fallbackReason = lang === 'tr' ? 'AI anahtarı tanımlı değil.' : 'AI key is not defined.';
      return this.createFallbackSuggestion(title, description, services, fallbackReason);
    }

    for (const model of this.modelPool) {
      try {
        const serviceNames = services.map((service) => service.name).join(', ');
        const prompt = `
          You are an expert SRE and Incident Manager. 
          Analyze the following incident report and suggest the most appropriate severity level and affected service.
          
          Incident Title: ${title}
          Incident Description: ${description}
          
          Severity levels must be one of: low, medium, high, critical.
          Affected service must be one of these registered service names: ${serviceNames || 'General'}.
          
          Detect the input language (Turkish or English). 
          The "reasoning" field MUST be in the same language as the input.
          
          Return ONLY a JSON object with the following structure:
          {
            "severity": "low" | "medium" | "high" | "critical",
            "serviceName": "registered service name",
            "reasoning": "brief explanation in the detected language"
          }
        `;

        const result = await this.genAI.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                severity: {
                  type: Type.STRING,
                  enum: Object.values(IncidentSeverity),
                },
                serviceName: {
                  type: Type.STRING,
                  enum: services.length > 0 ? services.map((service) => service.name) : undefined,
                },
                reasoning: {
                  type: Type.STRING,
                },
              },
              required: ['severity', 'serviceName', 'reasoning'],
              propertyOrdering: ['severity', 'serviceName', 'reasoning'],
            },
          },
        });
        
        const text = result.text ?? '';
        const suggestion = this.parseSuggestion(text, services, lang);
        
        if (suggestion) {
          if (model !== this.modelPool[0]) {
            this.logger.log(`Used fallback model: ${model}`);
          }
          return suggestion;
        }
      } catch (error: unknown) {
        this.logger.warn(
          `Model ${model} failed: ${this.getErrorMessage(error)}. Trying next...`,
        );
      }
    }

    const fallbackReason = lang === 'tr'
      ? 'Tüm AI modelleri şu an meşgul, tahmini öneriler kullanıldı.'
      : 'All AI models are currently busy, used heuristic suggestions.';
      
    return this.createFallbackSuggestion(
      title,
      description,
      services,
      fallbackReason,
    );
  }

  private parseSuggestion(
    text: string,
    services: Service[],
    lang: 'tr' | 'en',
  ): IncidentAiSuggestion | null {
    const jsonMatch = text.replace(/```json|```/g, '').match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as {
        severity?: string;
        serviceName?: string;
        reasoning?: string;
      };

      if (!this.isSeverity(parsed.severity)) {
        return null;
      }

      const matchedService = this.matchRegisteredService(
        parsed.serviceName,
        services,
      );

      const defaultReasoning = lang === 'tr' ? 'AI tarafından önerildi.' : 'Suggested by AI.';

      return {
        severity: parsed.severity,
        serviceId: matchedService.id,
        serviceName: matchedService.name,
        reasoning: parsed.reasoning?.trim() || defaultReasoning,
      };
    } catch {
      return null;
    }
  }

  private createFallbackSuggestion(
    title: string,
    description: string,
    services: Service[],
    reason: string,
  ): IncidentAiSuggestion {
    const service = this.matchRegisteredService(
      this.inferServiceName(title, description),
      services,
    );

    return {
      severity: this.inferSeverity(title, description),
      serviceId: service.id,
      serviceName: service.name,
      reasoning: reason,
    };
  }

  async summarizeIncident(
    title: string,
    description: string,
  ): Promise<IncidentAiSummary> {
    const lang = this.detectLanguage(`${title} ${description}`);

    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY is not defined. Returning heuristic summary.');
      return {
        summary: this.createFallbackSummary(title, description),
      };
    }

    for (const model of this.modelPool) {
      try {
        const prompt = `
          You are an expert SRE and Incident Manager.
          Summarize the following incident description for a dashboard list.
  
          Incident Title: ${title}
          Incident Description: ${description}
  
          Detect the input language (Turkish or English).
          Return a single concise sentence in the SAME language as the input. 
          Keep the impact and affected behavior clear.
  
          Return ONLY a JSON object with this structure:
          {
            "summary": "brief summary in the detected language"
          }
        `;
  
        const result = await this.genAI.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                },
              },
              required: ['summary'],
              propertyOrdering: ['summary'],
            },
          },
        });
  
        const summaryText = this.parseSummary(result.text ?? '');
        if (summaryText) {
          return { summary: summaryText };
        }
      } catch (error: unknown) {
        this.logger.warn(
          `Summary model ${model} failed: ${this.getErrorMessage(error)}. Trying next...`,
        );
      }
    }

    return {
      summary: this.createFallbackSummary(title, description),
    };
  }

  private detectLanguage(text: string): 'tr' | 'en' {
    const trChars = /[ğüşıöçĞÜŞİÖÇ]/;
    return trChars.test(text) ? 'tr' : 'en';
  }

  private parseSummary(text: string): string | null {
    const jsonMatch = text.replace(/```json|```/g, '').match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]) as { summary?: string };
      return parsed.summary?.trim() || null;
    } catch {
      return null;
    }
  }

  private createFallbackSummary(title: string, description: string): string {
    const normalizedDescription = description.replace(/\s+/g, ' ').trim();
    const source = normalizedDescription || title.replace(/\s+/g, ' ').trim();

    if (source.length <= 160) {
      return source;
    }

    return `${source.slice(0, 157).trim()}...`;
  }

  private inferSeverity(title: string, description: string): IncidentSeverity {
    const content = `${title} ${description}`.toLowerCase();

    if (
      /\b(critical|outage|down|offline|unavailable|data loss|security breach|payment failure)\b/.test(
        content,
      )
    ) {
      return IncidentSeverity.CRITICAL;
    }

    if (/\b(high|timeout|5xx|error spike|failed|failure|degraded|latency)\b/.test(content)) {
      return IncidentSeverity.HIGH;
    }

    if (/\b(low|minor|warning|cosmetic|intermittent)\b/.test(content)) {
      return IncidentSeverity.LOW;
    }

    return IncidentSeverity.MEDIUM;
  }

  private inferServiceName(title: string, description: string): string {
    const content = `${title} ${description}`.toLowerCase();
    const serviceMatchers: Array<[RegExp, string]> = [
      [/\b(payment|checkout|invoice|billing)\b/, 'Payment API'],
      [/\b(auth|login|token|session|oauth)\b/, 'Auth Service'],
      [/\b(search|index|query)\b/, 'Search Service'],
      [/\b(database|postgres|db|sql)\b/, 'Database'],
      [/\b(kafka|queue|consumer|producer|event)\b/, 'Event Pipeline'],
      [/\b(cache|redis)\b/, 'Cache Service'],
      [/\b(email|smtp|notification|push)\b/, 'Notification Service'],
      [/\b(api|gateway|endpoint)\b/, 'API Gateway'],
    ];

    return serviceMatchers.find(([pattern]) => pattern.test(content))?.[1] ?? 'General';
  }

  private matchRegisteredService(serviceName: string | undefined, services: Service[]) {
    if (services.length === 0) {
      return {
        id: '',
        name: serviceName?.trim() || 'General',
      };
    }

    const normalizedServiceName = serviceName?.trim().toLowerCase();
    const exactMatch = services.find(
      (service) => service.name.toLowerCase() === normalizedServiceName,
    );

    if (exactMatch) {
      return exactMatch;
    }

    const generalService = services.find(
      (service) => service.name.toLowerCase() === 'general',
    );

    return generalService ?? services[0];
  }

  private isSeverity(severity?: string): severity is IncidentSeverity {
    return Object.values(IncidentSeverity).includes(severity as IncidentSeverity);
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
} 
