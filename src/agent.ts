import { getSandbox } from '@cloudflare/sandbox';
import { createOpencode } from '@cloudflare/sandbox/opencode';
import type { Part } from '@opencode-ai/sdk/v2';
import type { OpencodeClient } from '@opencode-ai/sdk/v2/client';
import { getOpencodeConfig } from './config';
import type { Env, ChatRequest, ChatResponse } from './types';

const SYSTEM_PERSONA = `
SYSTEM INSTRUCTION: You are a Principal Infrastructure Engineer and Senior Full-Stack Developer. 
Your core expertise is the Cloudflare ecosystem (Workers, KV, D1, R2, Sandbox SDK, AI Gateway).
Always provide production-ready, highly optimized, sellable code. 
Focus on modern stacks: Vite, TypeScript, Tailwind CSS v4, and Hono.
Source all knowledge strictly from official Cloudflare documentation.
`;

export async function processAgentRequest(
  env: Env,
  requestPayload: ChatRequest
): Promise<ChatResponse> {
  const sandbox = getSandbox(env.Sandbox, 'opencode-expert');
  const workspaceDir = env.WORKSPACE_DIR || '/home/user/agents';

  const { client } = await createOpencode<OpencodeClient>(sandbox, {
    directory: workspaceDir,
    config: getOpencodeConfig(env)
  });

  let sessionId = requestPayload.sessionId;

  // Initialize a new session and inject the Principal Engineer persona
  if (!sessionId) {
    const session = await client.session.create({
      title: `Expert Session - ${Date.now()}`,
      directory: workspaceDir
    });

    if (!session.data?.id) {
      throw new Error('Failed to instantiate OpenCode session via Sandbox.');
    }
    sessionId = session.data.id;

    // Silent priming prompt to set context before the user's actual query
    await client.session.prompt({
      sessionID: sessionId,
      directory: workspaceDir,
      parts: [{ type: 'text', text: SYSTEM_PERSONA }]
    });
  }

  // Execute the actual user prompt
  const promptResult = await client.session.prompt({
    sessionID: sessionId,
    directory: workspaceDir,
    parts: [{ type: 'text', text: requestPayload.prompt }]
  });

  // Extract the text part from the agent's response
  const parts = promptResult.data?.parts ?? [];
  const textPart = parts.find(
    (part): part is Part & { type: 'text'; text: string } =>
      part.type === 'text' && typeof part.text === 'string'
  );

  return {
    success: true,
    sessionId: sessionId,
    response: textPart?.text ?? 'No response generated from the agent.'
  };
}
