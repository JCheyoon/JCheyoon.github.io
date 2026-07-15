export interface AdminJwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export const ADMIN_TOKEN_STORAGE_KEY = "blog.admin.token";

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return globalThis.atob(padded);
}

export function parseAdminJwt(token: string): AdminJwtPayload | null {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(parts[1])) as AdminJwtPayload;
  } catch {
    return null;
  }
}

export function isAdminJwtUsable(token: string, skewSeconds = 30): boolean {
  const payload = parseAdminJwt(token);

  if (!payload?.exp) {
    return false;
  }

  return Date.now() < (payload.exp - skewSeconds) * 1000;
}

export function getAdminEmailFromToken(token: string | null): string | null {
  if (!token) {
    return null;
  }

  const payload = parseAdminJwt(token);

  return typeof payload?.email === "string" ? payload.email : null;
}

export function readStoredAdminToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function persistAdminToken(token: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    return;
  }

  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
}

export interface CreateAdminPostPayload {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
}

const adminApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

function buildAdminApiUrl(path: string): string {
  return `${adminApiBaseUrl}${path}`;
}

export async function loginAdmin(
  credentials: AdminLoginCredentials,
): Promise<AdminLoginResponse> {
  const response = await fetch(buildAdminApiUrl("/api/admin/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Admin login failed");
  }

  return (await response.json()) as AdminLoginResponse;
}

export async function createAdminPost(
  token: string,
  payload: CreateAdminPostPayload,
): Promise<unknown> {
  const response = await fetch(buildAdminApiUrl("/api/admin/posts"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to create post");
  }

  return response.json();
}
