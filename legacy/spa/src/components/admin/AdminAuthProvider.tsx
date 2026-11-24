import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  isAdminJwtUsable,
  persistAdminToken,
  readStoredAdminToken,
} from "@/lib/adminAuth";

interface AdminAuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    readStoredAdminToken(),
  );

  useEffect(() => {
    if (token && !isAdminJwtUsable(token)) {
      setToken(null);
      return;
    }

    persistAdminToken(token);
  }, [token]);

  const isAuthenticated = Boolean(token && isAdminJwtUsable(token));

  const signIn = useCallback((nextToken: string) => {
    setToken(nextToken);
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ token, isAuthenticated, signIn, signOut }),
    [token, isAuthenticated, signIn, signOut],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
