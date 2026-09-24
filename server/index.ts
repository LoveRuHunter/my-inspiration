/**
 * Fastify-хост для tRPC-роутера Holocron.
 *
 * Слушает :4000, CORS открыт для :3000 (Vite dev-сервер).
 * Позже сюда прицепится реальное подключение к Postgres + PostGIS через Drizzle.
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import type { FastifyTRPCPluginOptions } from '@trpc/server/adapters/fastify';

import { appRouter, type AppRouter } from './router.ts';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '127.0.0.1';

async function main() {
  const server = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss' },
      },
    },
  });

  await server.register(cors, {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173'],
    credentials: true,
  });

  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: appRouter,
      createContext: () => ({}),
      onError({ path, error }) {
        server.log.error({ path, error }, 'tRPC error');
      },
    } satisfies FastifyTRPCPluginOptions<AppRouter>['trpcOptions'],
  });

  server.get('/health', () => ({ status: 'ok', service: 'holocron-api' }));

  try {
    await server.listen({ port: PORT, host: HOST });
    server.log.info(`Holocron API ready at http://${HOST}:${PORT}/trpc`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
