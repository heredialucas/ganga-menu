import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const keys = () =>
  createEnv({
    server: {
      STRIPE_API_KEY: z.string().min(1),
      STRIPE_WEBHOOK_SECRET: z.string().min(1),
    },
    client: {},
    experimental__runtimeEnv: {
      STRIPE_API_KEY: process.env.STRIPE_API_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    },
  });
