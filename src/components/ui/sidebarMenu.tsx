import { Card, CardContent } from "@repo/shadcn-ui/components/ui/card";
import type { Category } from "@/types/types";

interface SidebarMenuProps {
  tree: Category[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const SidebarMenu = ({
  tree,
  selectedCategory,
  onSelect,
}: SidebarMenuProps) => {
  return (
    <Card className="w-68 py-3">
      <CardContent className="px-3">
        <div>
          <div className="flex items-center mb-4">
            <span className="w-1 h-6 bg-muted mr-2 rounded" />
            <h2 className="text-lg font-semibold text-muted-foreground pl-1">
              Categories
            </h2>
          </div>
          <ul className="flex flex-col gap-1">
            <CategoryButton
              label="All"
              isActive={selectedCategory === "All"}
              onClick={() => onSelect("All")}
            />

            {tree.map((cat) => (
              <li key={cat.id}>
                <CategoryButton
                  label={cat.name}
                  isActive={selectedCategory === cat.name}
                  onClick={() => onSelect(cat.name)}
                />
                {cat.children && cat.children.length > 0 && (
                  <ul className="mt-1 gap-1">
                    {cat.children.map((child) => (
                      <li key={child.id}>
                        <span className="bg-border" />
                        <CategoryButton
                          label={child.name}
                          isActive={selectedCategory === child.name}
                          onClick={() => onSelect(child.name)}
                          isSub
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

function CategoryButton({
  label,
  isActive,
  onClick,
  isSub,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  isSub?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-md px-3 py-2 text-sm transition flex items-center gap-2
        ${
          isActive
            ? "bg-background text-foreground font-semibold"
            : "text-muted-foreground hover:bg-background hover:text-foreground"
        }
      `}
    >
      {isSub && <span className="text-muted-foreground/50 text-xs">└</span>}
      {label}
    </button>
  );
}

export default SidebarMenu;
