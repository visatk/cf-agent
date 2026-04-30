import { Hono } from 'hono';
import { getSandbox } from '@cloudflare/sandbox';
import { createOpencodeServer, proxyToOpencode } from '@cloudflare/sandbox/opencode';
import { processAgentRequest } from './agent';
import { getOpencodeConfig } from './config';
import type { Env, ChatRequest } from './types';

// Export the required Sandbox class for the binding to function
export { Sandbox } from '@cloudflare/sandbox';

const app = new Hono<{ Bindings: Env }>();

/**
 * Programmatic SDK Endpoint
 * Expects JSON: { "prompt": "Deploy a D1 database architecture..." }
 */
app.post('/api/expert', async (c) => {
  try {
    const body = await c.req.json<ChatRequest>();
    
    if (!body.prompt) {
      return c.json({ success: false, error: 'Prompt is required.' }, 400);
    }

    const result = await processAgentRequest(c.env, body);
    return c.json(result);

  } catch (error) {
    console.error('Agent Execution Error:', error);
    return c.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal Server Error' 
      }, 
      500
    );
  }
});

/**
 * Web UI Proxy 
 * Routes all other traffic to the OpenCode web interface running inside the sandbox.
 */
app.all('/*', async (c) => {
  const sandbox = getSandbox(c.env.Sandbox, 'opencode-expert');
  const workspaceDir = c.env.WORKSPACE_DIR || '/home/user/agents';

  const server = await createOpencodeServer(sandbox, {
    directory: workspaceDir,
    config: getOpencodeConfig(c.env)
  });

  return proxyToOpencode(c.req.raw, sandbox, server);
});

export default app;
