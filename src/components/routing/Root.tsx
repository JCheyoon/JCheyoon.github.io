import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { Navbar04 } from "@/components/ui/shadcn-io/navbar-04";
import CardProduct from "@/components/ui/cardProduct";
import SidebarMenu from "@/components/ui/sidebarMenu";
import { useCategoryCache } from "@/lib/category-cache";
import Footer from "../ui/footer";

const Root = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") ?? "All";
  const { data: categoryTree = [] } = useCategoryCache();

  const handleCategorySelect = (category: string) => {
    if (category === "All") {
      navigate("/");
    } else {
      navigate(`/?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background flex flex-col items-center">
        <div className="w-full max-w-[1200px]">
          <Navbar04 />
          <div className="flex py-6">
            <div className="flex flex-col gap-6">
              <CardProduct />
              <SidebarMenu
                tree={categoryTree}
                selectedCategory={selectedCategory}
                onSelect={handleCategorySelect}
              />
            </div>
            <div className="flex-1 overflow-auto pl-6">
              <Outlet context={{ selectedCategory }} />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Root;
