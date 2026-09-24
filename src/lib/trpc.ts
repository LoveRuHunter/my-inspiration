/**
 * tRPC-клиент Holocron.
 *
 * Подключается к бэкенду на :4000 (адрес переопределяется через VITE_API_URL).
 * Тип роутера импортируется type-only, поэтому серверный код не попадает в бандл.
 */

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '../../server/router';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:4000/trpc';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: API_URL,
      transformer: superjson,
    }),
  ],
});
