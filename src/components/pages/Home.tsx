import { useOutletContext } from "react-router-dom";
import PostList from "@/components/home/postList";
import type { OutletContext } from "@/types/types";

const dummyPosts = [
  {
    id: 1,
    category: "Web Development",
    title: "Getting Started with Modern Web Development: A Complete Guide",
    description:
      "Dive into the fundamentals of modern web development. Learn about essential tools, frameworks, and best practices that will help you build robust and scalable web applications in today's fast-paced development environment.",
    author: "Jung cheyoon",
    date: "March 15, 2026",
  },
  {
    id: 2,
    category: "Frontend",
    title: "The Ultimate Guide to State Management in Frontend Applications",
    description:
      "Explore different approaches to managing state in frontend applications. From local state to global solutions, learn how to choose the right strategy for your project's specific needs and complexity.",
    author: "Jung cheyoon",
    date: "April 2, 2026",
  },
  {
    id: 3,
    category: "Frontend",
    title: "The Ultimate Guide to State Management in Frontend Applications",
    description:
      "Explore different approaches to managing state in frontend applications. From local state to global solutions, learn how to choose the right strategy for your project's specific needs and complexity.",
    author: "Jung cheyoon",
    date: "April 2, 2026",
  },
  {
    id: 4,
    category: "Frontend",
    title: "The Ultimate Guide to State Management in Frontend Applications",
    description:
      "Explore different approaches to managing state in frontend applications. From local state to global solutions, learn how to choose the right strategy for your project's specific needs and complexity.",
    author: "Jung cheyoon",
    date: "April 2, 2026",
  },
];

const Home = () => {
  const { selectedCategory } = useOutletContext<OutletContext>();
  const filteredPosts =
    selectedCategory !== "All"
      ? dummyPosts.filter((post) => post.category === selectedCategory)
      : dummyPosts;

  const postCount = filteredPosts.length;
  const postLabel = postCount === 1 ? "post" : "posts";

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to cheyoon blog 👋
        </h1>
      </section>
      {selectedCategory && (
        <section className="space-y-1">
          <h2 className="text-sm text-muted-foreground">
            {postCount} {postLabel} in this category
          </h2>
        </section>
      )}
      <PostList posts={filteredPosts} />
    </div>
  );
};

export default Home;
