import { Card, CardContent } from "@repo/shadcn-ui/components/ui/card";
import type { Post } from "@/types/types";

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  console.log(posts, "posts");

  if (posts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No posts in this category yet.
      </p>
    );
  }

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
              <span className="font-semibold">{post.author}</span>
              {" · "}
              {post.date}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
