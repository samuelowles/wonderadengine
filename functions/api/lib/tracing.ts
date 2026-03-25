/**
 * Lightweight LangSmith tracing for Cloudflare Workers.
 * Uses direct REST calls (awaited) instead of the SDK's traceable wrapper,
 * which relies on background async tasks that CF Workers kill.
 */

const LANGSMITH_API = 'https://api.smith.langchain.com';

interface TraceRun {
    id: string;
    name: string;
    run_type: 'llm' | 'chain' | 'tool';
    inputs: Record<string, unknown>;
    start_time: string;
    session_name?: string;
    parent_run_id?: string;
}

interface TraceUpdate {
    outputs?: Record<string, unknown>;
    end_time: string;
    error?: string;
}

function uuid(): string {
    return crypto.randomUUID();
}

export class LangSmithTracer {
    private apiKey: string;
    private project: string;

    constructor(apiKey: string, project = 'Wondura') {
        this.apiKey = apiKey;
        this.project = project;
    }

    get enabled(): boolean {
        return !!this.apiKey && this.apiKey.length > 10;
    }

    async createRun(name: string, runType: 'llm' | 'chain' | 'tool', inputs: Record<string, unknown>, parentRunId?: string): Promise<string> {
        const runId = uuid();
        if (!this.enabled) return runId;

        const run: TraceRun = {
            id: runId,
            name,
            run_type: runType,
            inputs,
            start_time: new Date().toISOString(),
            session_name: this.project,
            ...(parentRunId ? { parent_run_id: parentRunId } : {}),
        };

        try {
            await fetch(`${LANGSMITH_API}/runs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                },
                body: JSON.stringify(run),
            });
        } catch (e) {
            console.error('[TRACING] Failed to create run:', e);
        }

        return runId;
    }

    async endRun(runId: string, outputs: Record<string, unknown>, error?: string): Promise<void> {
        if (!this.enabled) return;

        const update: TraceUpdate = {
            outputs,
            end_time: new Date().toISOString(),
            ...(error ? { error } : {}),
        };

        try {
            await fetch(`${LANGSMITH_API}/runs/${runId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                },
                body: JSON.stringify(update),
            });
        } catch (e) {
            console.error('[TRACING] Failed to end run:', e);
        }
    }
}
