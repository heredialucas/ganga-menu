import { keys as email } from '@repo/email/keys';
import { keys as flags } from '@repo/feature-flags/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as rateLimit } from '@repo/rate-limit/keys';
import { keys as security } from '@repo/security/keys';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [
    core(),
    email(),
    observability(),
    flags(),
    security(),
    rateLimit(),
  ],
  server: {},
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE: z.string().url(),
    NEXT_PUBLIC_STRIPE_PRO_LINK_TEST: z.string().url(),
    // URLs de redes sociales (opcionales)
    NEXT_PUBLIC_FACEBOOK_URL: z.string().url().optional(),
    NEXT_PUBLIC_INSTAGRAM_URL: z.string().url().optional(),
    NEXT_PUBLIC_LINKEDIN_URL: z.string().url().optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK_LIVE,
    NEXT_PUBLIC_STRIPE_PRO_LINK_TEST: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK_TEST,
    NEXT_PUBLIC_FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL,
    NEXT_PUBLIC_INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    NEXT_PUBLIC_LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL,
  },
});
