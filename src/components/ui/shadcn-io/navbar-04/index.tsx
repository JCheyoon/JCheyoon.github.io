"use client";

import * as React from "react";
import { useEffect, useState, useRef, useId } from "react";
import { GlobeIcon, SunIcon, MoonIcon } from "lucide-react";
import { SearchIcon } from "lucide-react";
import { Button } from "@repo/shadcn-ui/components/ui/button";
import { Input } from "@repo/shadcn-ui/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@repo/shadcn-ui/components/ui/navigation-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shadcn-ui/components/ui/select";
import { cn } from "@repo/shadcn-ui/lib/utils.ts";

// Logo component
const Logo = (props: React.SVGAttributes<SVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 324 323"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...(props as any)}
  >
    <rect
      x="88.1023"
      y="144.792"
      width="151.802"
      height="36.5788"
      rx="18.2894"
      transform="rotate(-38.5799 88.1023 144.792)"
      fill="currentColor"
    />
    <rect
      x="85.3459"
      y="244.537"
      width="151.802"
      height="36.5788"
      rx="18.2894"
      transform="rotate(-38.5799 85.3459 244.537)"
      fill="currentColor"
    />
  </svg>
);

// Hamburger icon
const HamburgerIcon = ({
  className,
  ...props
}: React.SVGAttributes<SVGElement>) => (
  <svg
    className={cn("pointer-events-none", className)}
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...(props as any)}
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

// Theme toggle button
const ThemeToggle = ({
  onThemeChange,
}: {
  onThemeChange?: (theme: "light" | "dark") => void;
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 cursor-pointer"
      onClick={toggleTheme}
    >
      {theme === "light" ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

// Types
export interface Navbar04NavItem {
  href?: string;
  label: string;
}

export interface NavbarLanguage {
  value: string;
  label: string;
}

export interface Navbar04Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  navigationLinks?: Navbar04NavItem[];
  languages?: NavbarLanguage[];
  onNavItemClick?: (href: string) => void;
  onLanguageChange?: (language: string) => void;
  onThemeChange?: (theme: "light" | "dark") => void;
  onSearchSubmit?: (query: string) => void;
}

// Default links
const defaultNavigationLinks: Navbar04NavItem[] = [
  { href: "#", label: "Home" },
  { href: "#", label: "About" },
  { href: "#", label: "Archive" },
  { href: "#", label: "Github" },
];

const defaultLanguage: NavbarLanguage[] = [
  { value: "en", label: "En" },
  { value: "kr", label: "Kr" },
];

export const Navbar04 = React.forwardRef<HTMLElement, Navbar04Props>(
  (
    {
      className,
      logo = <Logo />,
      navigationLinks = defaultNavigationLinks,
      languages = defaultLanguage,
      onNavItemClick,
      onLanguageChange,
      onThemeChange,
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(false);
    const [language, setLanguage] = useState("en");
    const containerRef = useRef<HTMLElement>(null);
    const searchId = useId();

    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          setIsMobile(containerRef.current.offsetWidth < 768);
        }
      };
      checkWidth();
      const observer = new ResizeObserver(checkWidth);
      if (containerRef.current) observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, []);

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref]
    );

    return (
      <header
        ref={combinedRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline h-[72px] rounded-b-xl",
          className
        )}
        {...props}
      >
        <div className="container relative mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Logo section */}
          <button className="flex items-center space-x-2 flex-shrink-0">
            <div className="text-2xl">{logo}</div>
          </button>
          {!isMobile && (
            <div className="flex-1 flex justify-center max-w-[1200px]">
              <NavigationMenu>
                <NavigationMenuList className="flex gap-2">
                  {navigationLinks.map((link) => (
                    <NavigationMenuItem key={link.label}>
                      <NavigationMenuLink
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          if (onNavItemClick && link.href)
                            onNavItemClick(link.href);
                        }}
                        className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground hover:text-primary focus:bg-accent focus:text-accent-foreground"
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}

          {/* Right side: search, theme toggle, language, mobile menu */}
          <div className="flex items-center gap-3">
            {/* Search form */}
            {!isMobile && (
              <form className="relative" onSubmit={(e) => e.preventDefault()}>
                <Input
                  id={searchId}
                  name="search"
                  className="peer h-9 ps-8 pe-2 py-2 max-w-40 bg-[#F5F4F4] rounded-md"
                  placeholder="Search"
                  type="search"
                />
                <div className="absolute inset-y-0 start-0 flex items-center justify-center ps-2 text-muted-foreground/80 pointer-events-none">
                  <SearchIcon size={16} />
                </div>
              </form>
            )}

            {/* Theme toggle */}
            <ThemeToggle onThemeChange={onThemeChange} />

            {/* Language selector */}
            <Select
              onValueChange={(value) => {
                setLanguage(value);
                onLanguageChange?.(value);
              }}
            >
              <SelectTrigger
                id={`language-selector-${searchId}`}
                className="[&>svg]:text-muted-foreground/80 hover:bg-accent hover:text-accent-foreground h-8 border-none px-2 shadow-none [&>svg]:shrink-0 cursor-pointer"
              >
                <GlobeIcon size={16} aria-hidden />
                <SelectValue className="hidden sm:inline-flex" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="bg-background rounded-md shadow-md [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2"
              >
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    <span className="flex items-center gap-2">
                      <span className="truncate">{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mobile hamburger menu */}
            {isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="h-9 w-9 bg-background rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer"
                    size="icon"
                  >
                    <HamburgerIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="md:hidden w-64 p-2 bg-background rounded-md shadow-md">
                  <div className="flex flex-col gap-1">
                    {navigationLinks.map((link) => (
                      <button
                        key={link.label}
                        onClick={(e) => e.preventDefault()}
                        className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                      >
                        {link.label}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </header>
    );
  }
);

Navbar04.displayName = "Navbar04";

export { Logo, HamburgerIcon, ThemeToggle };
