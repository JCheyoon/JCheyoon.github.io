import { Card, CardContent } from "@repo/shadcn-ui/components/ui/card";

interface SidebarMenuProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const SidebarMenu = ({
  categories,
  selectedCategory,
  onSelect,
}: SidebarMenuProps) => {
  return (
    <Card className="w-68 py-3">
      <CardContent className="px-3">
        <div>
          <div className="flex items-center mb-4">
            <span className="w-1 h-6 bg-muted mr-2 rounded" />
            <h2 className="text-lg font-semibold text-muted-foreground">
              Categories
            </h2>
          </div>
          <ul className="flex flex-col gap-2">
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <li key={category}>
                  <button
                    onClick={() => onSelect(category)}
                    className={`
                      w-full text-left rounded-md px-4 py-2 text-sm transition
                      ${
                        isActive
                          ? "bg-muted text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }
                    `}
                  >
                    {category}
                  </button>
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
