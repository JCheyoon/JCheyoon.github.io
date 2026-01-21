import { Outlet } from "react-router-dom";
import { Navbar04 } from "@/components/ui/shadcn-io/navbar-04";
import CardProduct from "@/components/ui/shadcn-io/cardProduct/cardProduct";
import SidebarMenu from "@/components/ui/shadcn-io/sidebarMenu/sidebarMenu";

const Root = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-[1200px]">
          <Navbar04 />
          <div className="flex py-6">
            <div className="flex flex-col gap-6">
              <CardProduct />
              <SidebarMenu />
            </div>
            <div className="flex-1 overflow-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Root;
