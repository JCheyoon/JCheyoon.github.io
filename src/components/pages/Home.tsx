import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PostList from "@/components/home/postList";
import { fetchPosts } from "@/lib/posts";
import type { Post, OutletContext } from "@/types/types";

const Home = () => {
  const { selectedCategory } = useOutletContext<OutletContext>();
  const tag = selectedCategory !== "All" ? selectedCategory : undefined;

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ["posts", tag],
    queryFn: () => fetchPosts(tag),
    staleTime: 30_000,
  });

  const postCount = posts.length;
  const postLabel = postCount === 1 ? "post" : "posts";

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to cheyoon blog 👋
        </h1>
      </section>
      {selectedCategory !== "All" && (
        <section className="space-y-1">
          <h2 className="text-sm text-slate-500">
            {postCount} {postLabel} in this category
          </h2>
        </section>
      )}
      <PostList posts={posts} />
    </div>
  );
};

export default Home;
