import { Card, CardContent } from "@repo/shadcn-ui/components/ui/card";

const posts = [
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

export default function PostList() {
  return (
    <div className="grid gap-6">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {post.category}
            </p>
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {post.description}
            </p>
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">{post.author}</span> on{" "}
              {post.date}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
