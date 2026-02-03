/// <reference types="@cloudflare/workers-types" />

interface Env {
    GOOGLE_AI_KEY: string;
    PARALLEL_API_KEY: string;
    APP_ENV: string;
}

// Re-export PagesFunction for use in function files
type PagesFunction<E = Env> = (context: EventContext<E, string, unknown>) => Response | Promise<Response>;
