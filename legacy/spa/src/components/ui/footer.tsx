const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background py-10 text-muted-foreground text-sm font-sans border-t border-border">
      <div className="w-full flex flex-col items-center justify-center">
        <div className="w-full flex justify-center text-center px-6 pt-2">
          <div className="flex flex-wrap justify-center items-center gap-1">
            <span>© {currentYear}</span>
            <span className="font-semibold text-foreground">Jung cheyoon.</span>
            <span>All Rights Reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
