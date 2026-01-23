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

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Root />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="archive" element={<Archive />} />
      <Route path="portfolio" element={<Portfolio />} />
      <Route path="post/:id" element={<Post />} />
    </Route>,
  ),
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
