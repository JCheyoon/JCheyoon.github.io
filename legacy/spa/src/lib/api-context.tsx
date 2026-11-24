import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { createApiClient, DEFAULT_API_BASE_URL } from "./api";
import type { ApiClient } from "./api";

const ApiClientContext = createContext<ApiClient | null>(null);

export function ApiProvider({
  children,
  baseUrl = DEFAULT_API_BASE_URL,
}: {
  children: ReactNode;
  baseUrl?: string;
}) {
  const client = useMemo(() => createApiClient({ baseUrl }), [baseUrl]);

  return (
    <ApiClientContext.Provider value={client}>
      {children}
    </ApiClientContext.Provider>
  );
}

export function useApiClient() {
  const context = useContext(ApiClientContext);

  return context;
}
