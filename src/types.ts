export interface Env {
  Sandbox: any; // Sandbox Binding
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_API_TOKEN: string;
  AI_GATEWAY_ID: string;
  WORKSPACE_DIR: string;
}

export interface ChatRequest {
  prompt: string;
  sessionId?: string; // Optional: To resume an existing OpenCode session
}

export interface ChatResponse {
  success: boolean;
  sessionId: string;
  response: string;
  error?: string;
}
