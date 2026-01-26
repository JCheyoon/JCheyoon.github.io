const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#f8fafb] py-10 text-[#71767b] text-sm font-sans">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl px-6">
          <div className="border-t border-dashed border-gray-300 mb-8 opacity-60"></div>
        </div>
        <div className="w-full flex justify-center text-center px-6 pt-2">
          <div className="flex flex-wrap justify-center items-center gap-1">
            <span>© {currentYear}</span>
            <span className="font-semibold text-gray-700">Jung cheyoon.</span>
            <span>All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
