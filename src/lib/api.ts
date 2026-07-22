export const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiClientConfig {
  baseUrl: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonValue = Record<string, any> | any[];

export interface ApiRequestOptions extends Omit<
  RequestInit,
  "body" | "headers"
> {
  headers?: HeadersInit;
  body?: BodyInit | JsonValue | null;
  query?: Record<string, string | number | boolean | null | undefined>;
}

export class ApiError extends Error {
  status: number;
  body: string;

  constructor(message: string, status: number, body = "") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, "");
}

function buildUrl(
  baseUrl: string,
  path: string,
  query?: ApiRequestOptions["query"],
): string {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const url = normalizedBaseUrl ? `${normalizedBaseUrl}${path}` : path;

  if (!query) {
    return url;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();

  return queryString ? `${url}?${queryString}` : url;
}

async function parseResponseBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

export interface ApiClient {
  baseUrl: string;
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>;
}

export function createApiClient(): ApiClient {
  const baseUrl = DEFAULT_API_BASE_URL;

  const request = async <T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<T> => {
    const headers = new Headers(options.headers);
    let body: BodyInit | undefined;

    if (
      options.body instanceof FormData ||
      options.body instanceof Blob ||
      typeof options.body === "string"
    ) {
      body = options.body;
    } else if (options.body !== null && options.body !== undefined) {
      body = JSON.stringify(options.body);
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
    }

    const response = await fetch(buildUrl(baseUrl, path, options.query), {
      ...options,
      headers,
      body,
    });

    const responseText = await parseResponseBody(response);

    if (!response.ok) {
      throw new ApiError(
        responseText || `Request failed with status ${response.status}`,
        response.status,
        responseText,
      );
    }

    if (!responseText) {
      return undefined as T;
    }

    return JSON.parse(responseText) as T;
  };

  return { baseUrl, request };
}

export const apiClient: ApiClient = createApiClient();

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return apiClient.request<T>(path, options);
}
