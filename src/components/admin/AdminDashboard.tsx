import { Link } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthProvider";

export default function AdminDashboard() {
  const { adminEmail } = useAdminAuth();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Dashboard
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-950">
          Post control room
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">
          로그인은 JWT 기반이며, 이 화면에서는 업로드 전용 작업만 하도록
          분리합니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Signed in as</p>
          <p className="mt-2 break-all text-lg font-semibold text-slate-950">
            {adminEmail ?? "unknown"}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Protection model</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            JWT bearer only
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-500">Upload target</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">
            /api/admin/posts
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-950">Quick actions</h3>
        <p className="mt-2 text-sm text-slate-600">
          글 작성 화면으로 이동해서 제목, slug, 본문, 상태를 입력한 뒤
          업로드하세요.
        </p>
        <Link
          to="/admin/posts/new"
          className="mt-5 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Create new post
        </Link>
      </div>
    </div>
  );
}
