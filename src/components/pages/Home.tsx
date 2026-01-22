import PostList from "@repo/components/ui/postList";
import { NavLink } from "react-router-dom";
import { useState } from "react";

type Category = {
  id: number;
  name: string;
};

const Home = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, name: "Web Development" },
    { id: 2, name: "Frontend" },
  ]);

  return (
    <div>
      <section className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to cheyoon blog👋
        </h1>
      </section>
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
          📂
          {categories.map((category) => (
            <li key={category.id}>
              <NavLink
                to={`/post/${category.name.toLowerCase()}`}
                className={({ isActive }) =>
                  `
                transition
                ${
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }
                `
                }
              >
                {category.name}
              </NavLink>
            </li>
          ))}
        </h2>
      </section>
      <PostList />
    </div>
  );
};

export default Home;
