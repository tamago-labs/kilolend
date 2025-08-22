'use client';

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 24 * 60 * 60 * 1000,
      retry(failureCount, error) {
        switch (error.message) {
          case 'ERR_NETWORK':
            return failureCount < 3;
          default:
            return false;
        }
      },
      throwOnError(error) {
        switch (error.message) {
          case 'ERR_NETWORK':
            return false;
          default:
            return true;
        }
      },
    },
    mutations: {
      onError: () => {},
    },
  },
});
