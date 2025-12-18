import { Outlet } from "react-router-dom";
import Navigation from "../ui/Navigation";

const Root = () => {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        <div className="w-full max-w-[1200px]">
          <Navigation />
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Root;
