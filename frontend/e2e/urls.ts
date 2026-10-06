import { e2ePort } from "./port";

export const backendPort = e2ePort(process.env.ASSESS_E2E_BACKEND_PORT, 8100);
export const frontendPort = e2ePort(process.env.ASSESS_E2E_FRONTEND_PORT, 5180);
export const backendURL = `http://127.0.0.1:${backendPort}`;
export const frontendURL = `http://127.0.0.1:${frontendPort}`;
