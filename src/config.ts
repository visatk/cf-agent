import type { Config } from '@opencode-ai/sdk/v2';
import type { Env } from './types';

export const getOpencodeConfig = (env: Env): Config => {
  return {
    provider: {
      'cloudflare-ai-gateway': {
        options: {
          accountId: env.CLOUDFLARE_ACCOUNT_ID,
          gatewayId: env.AI_GATEWAY_ID,
          apiToken: env.CLOUDFLARE_API_TOKEN
        },
        models: {
          // Explicitly define the models permitted through the gateway
          // Use high-tier models for complex architecture tasks
          'anthropic/claude-3-5-sonnet': {},
          'workers-ai/meta/llama-3-8b-instruct': {}
        }
      }
    }
  };
};
