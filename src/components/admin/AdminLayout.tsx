import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-2xl px-4 py-3 text-sm font-medium transition",
    isActive
      ? "bg-slate-950 text-white shadow-lg"
      : "text-slate-600 hover:bg-slate-100",
  ].join(" ");

export default function AdminLayout() {
  const navigate = useNavigate();
  const { signOut } = useAdminAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Admin Console
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                signOut();
                navigate("/admin/login", { replace: true });
              }}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur">
            <nav className="flex flex-col gap-2">
              <NavLink to="/admin" end className={navItemClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/posts/new" className={navItemClass}>
                New post
              </NavLink>
            </nav>
          </aside>

          <main className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
