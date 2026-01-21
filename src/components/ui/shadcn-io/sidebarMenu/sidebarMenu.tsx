import { Card, CardContent } from "@repo/shadcn-ui/components/ui/card";
import { NavLink } from "react-router-dom";

const categories = ["Web Development", "Frontend", "Backend"];

const SidebarMenu = () => {
  return (
    <Card className="w-68 py-3">
      <CardContent className="px-3">
        <div>
          <div className="flex items-center mb-4">
            <span className="w-1 h-6 bg-muted mr-2 rounded pr-2"></span>
            <h2 className="text-lg font-semibold text-muted-foreground pl-2 pb-3">
              Categories
            </h2>
          </div>
          <ul className="flex flex-col gap-2">
            {categories.map((category) => {
              const path = `/post/${category.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <li key={category}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `
                      block rounded-md px-4 py-2 text-sm
                      transition
                      ${isActive ? "bg-muted text-foreground font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                      `
                    }
                  >
                    {category}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SidebarMenu;
