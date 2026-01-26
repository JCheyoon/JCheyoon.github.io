import { Outlet } from "react-router-dom";
import { Navbar04 } from "@/components/ui/shadcn-io/navbar-04";
import CardProduct from "@/components/ui/cardProduct";
import SidebarMenu from "@/components/ui/sidebarMenu";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@/types/types";
import Footer from "../ui/footer";

const dummyCategories: Category[] = [
  { id: 1, category: "Development" },
  { id: 2, category: "Frontend" },
  { id: 3, category: "Backend" },
];

const fetchCategories = async (): Promise<Category[]> => {
  // const res = await fetch("/api/categories");
  // if (!res.ok) throw new Error("Failed to fetch categories");
  // return res.json();
  return new Promise((resolve) => {
    setTimeout(() => resolve(dummyCategories), 100);
  });
};

const Root = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    select: (data: Category[]) => [{ id: 0, category: "All" }, ...data],
    staleTime: Infinity,
    placeholderData: [{ id: 0, category: "All" }],
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-[1200px]">
          <Navbar04 />
          <div className="flex py-6">
            <div className="flex flex-col gap-6">
              <CardProduct />
              <SidebarMenu
                categories={categories.map((c: Category) => c.category)}
                selectedCategory={selectedCategory}
                onSelect={setSelectedCategory}
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
