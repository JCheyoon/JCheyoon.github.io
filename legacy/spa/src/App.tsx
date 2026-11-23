import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Post from "./components/pages/Post";
import Archive from "./components/pages/Archive";
import Root from "./components/routing/Root";
import Portfolio from "./components/pages/Portfolio";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminAuthProvider } from "./components/admin/AdminAuthProvider";
import RequireAuth from "./components/admin/RequireAuth";
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminPostEditor from "./components/admin/AdminPostEditor";
import CategoryManager from "./components/admin/CategoryManager";
import { ApiProvider } from "./lib/api-context";

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Root />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="archive" element={<Archive />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="post/:slug" element={<Post />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="posts/new" element={<AdminPostEditor />} />
          <Route path="posts/:id/edit" element={<AdminPostEditor />} />
          <Route path="categories" element={<CategoryManager />} />
        </Route>
      </Route>
    </>,
  ),
);

function App() {
  return (
    <ApiProvider>
      <QueryClientProvider client={queryClient}>
        <AdminAuthProvider>
          <RouterProvider router={router} />
        </AdminAuthProvider>
      </QueryClientProvider>
    </ApiProvider>
  );
}

export default App;
