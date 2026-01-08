import { Outlet } from "react-router-dom";
import { Navbar04 } from "@/components/ui/shadcn-io/navbar-04";

const Root = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-[1200px]">
          <Navbar04 />
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Root;
