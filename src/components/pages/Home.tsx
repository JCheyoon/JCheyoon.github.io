import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PostList from "@/components/home/postList";
import { fetchPosts } from "@/lib/posts";
import { useCategoryCache, flattenCategories } from "@/lib/category-cache";
import type { OutletContext } from "@/types/types";

const Home = () => {
  const { selectedCategory } = useOutletContext<OutletContext>();
  const { data: categoryTree = [] } = useCategoryCache();
  const flatCats = flattenCategories(categoryTree);

  // Map selected name → slug. "All" means no filter.
  const selected = flatCats.find((c) => c.name === selectedCategory);
  const categorySlug = selectedCategory === "All" ? undefined : selected?.slug;

  const { data: posts = [] } = useQuery({
    queryKey: ["posts", categorySlug],
    queryFn: () => fetchPosts(undefined, categorySlug),
    staleTime: 30_000,
  });

  const postCount = posts.length;
  const postLabel = postCount === 1 ? "post" : "posts";

  return (
    <div className="space-y-6">
      {selectedCategory !== "All" && (
        <section className="space-y-1">
          <h2 className="text-sm text-muted-foreground">
            {postCount} {postLabel} in this category
          </h2>
        </section>
      )}
      <PostList posts={posts} />
    </div>
  );
};

export default Home;
