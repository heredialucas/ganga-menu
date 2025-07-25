import { keys as analytics } from '@repo/analytics/keys';
import { keys as auth } from '@repo/auth/keys';
import { keys as collaboration } from '@repo/collaboration/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as flags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as notifications } from '@repo/notifications/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { keys as security } from '@repo/security/keys';
import { keys as webhooks } from '@repo/webhooks/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// No extiendas `payments()` aquí para evitar conflictos de tipo
export const env = createEnv({
  extends: [
    auth(),
    analytics(),
    collaboration(),
    core(),
    database(),
    email(),
    flags(),
    notifications(),
    observability(),
    payments(),
    security(),
    webhooks(),
  ],
  server: {},
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE: z.string().url(),
    NEXT_PUBLIC_STRIPE_PRO_LINK_TEST: z.string().url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE,
    NEXT_PUBLIC_STRIPE_PRO_LINK_TEST: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK_TEST,
  },
});
