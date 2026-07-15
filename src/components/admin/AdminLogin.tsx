import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginAdmin } from "@/lib/adminAuth";
import { useAdminAuth } from "./AdminAuthProvider";

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const response = await loginAdmin({ email, password });
      signIn(response.token);
      const state = location.state as LoginLocationState | null;
      navigate(state?.from?.pathname ?? "/admin", { replace: true });
    } catch {
      setErrorMessage(
        "로그인에 실패했습니다. email/password를 다시 확인하세요.",
      );
    } finally {
      setPassword("");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.15),_transparent_35%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] px-4 py-8 text-white">
      <section className="w-full max-w-lg rounded-[2rem] border border-slate-200/60 bg-white p-8 text-slate-950 shadow-2xl sm:p-10">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Admin
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-950"
              placeholder="admin@example.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-slate-950"
              placeholder="••••••••"
            />
          </label>

          {errorMessage ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!password || !email}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sign in
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
