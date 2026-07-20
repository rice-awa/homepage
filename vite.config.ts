import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

interface LocalRequest {
  headers: { host?: string | string[] };
  method?: string;
  originalUrl?: string;
  url?: string;
}

interface LocalResponse {
  end(body: string): void;
  setHeader(name: string, value: string): void;
  statusCode: number;
}

interface ContributionModule {
  default(request: Request): Promise<Response>;
}

function localContributionApi(): Plugin {
  return {
    name: 'local-contribution-api',
    configureServer(server) {
      server.middlewares.use('/api/github-contributions', async (req, res, next) => {
        try {
          const incoming = req as unknown as LocalRequest;
          const outgoing = res as unknown as LocalResponse;
          const host = typeof incoming.headers.host === 'string' ? incoming.headers.host : 'localhost';
          const requestUrl = new URL(incoming.originalUrl ?? incoming.url ?? '/', `http://${host}`);
          const module = await server.ssrLoadModule('/api/github-contributions.ts') as ContributionModule;
          const response = await module.default(new Request(requestUrl, { method: incoming.method }));

          outgoing.statusCode = response.status;
          response.headers.forEach((value, key) => outgoing.setHeader(key, value));
          outgoing.end(await response.text());
        } catch (error) {
          next(error);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, '.', '');
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  if (environment.GITHUB_TOKEN && runtime.process?.env) {
    runtime.process.env.GITHUB_TOKEN = environment.GITHUB_TOKEN;
  }

  return {
    plugins: [react(), localContributionApi()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            gsap: ['gsap'],
            vendor: ['react', 'react-dom'],
          },
        },
      },
    },
  };
})
