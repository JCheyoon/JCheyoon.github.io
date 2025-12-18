"use client";

import * as React from "react";
import { useEffect, useState, useRef, useId } from "react";
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
import { cn } from "@repo/shadcn-ui/lib/utils.ts";

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
  return (
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
};

// Hamburger icon component
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

// Types
export interface Navbar04NavItem {
  href?: string;
  label: string;
}

export interface Navbar04Props extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: Navbar04NavItem[];
  signInText?: string;
  signInHref?: string;
  searchPlaceholder?: string;
  onSignInClick?: () => void;
  onSearchSubmit?: (query: string) => void;
}

// Default navigation links
const defaultNavigationLinks: Navbar04NavItem[] = [
  { href: "#", label: "Home" },
  { href: "#", label: "About" },
  { href: "#", label: "Archive" },
  { href: "#", label: "Github" },
];

export const Navbar04 = React.forwardRef<HTMLElement, Navbar04Props>(
  (
    {
      className,
      logo = <Logo />,
      logoHref = "#",
      navigationLinks = defaultNavigationLinks,
      signInText = "Sign In",
      signInHref = "#signin",
      searchPlaceholder = "Search...",
      onSignInClick,
      onSearchSubmit,
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const containerRef = useRef<HTMLElement>(null);
    const searchId = useId();

    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768); // 768px is md breakpoint
        }
      };

      checkWidth();

      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const query = formData.get("search") as string;
      if (onSearchSubmit) {
        onSearchSubmit(query);
      }
    };

    return (
      <header
        ref={combinedRef}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline",
          className
        )}
        {...(props as any)}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex flex-1 items-center gap-2">
            {/* Mobile menu trigger */}
            {isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                    variant="ghost"
                    size="icon"
                  >
                    <HamburgerIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="md:hidden w-64 p-2">
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
                    <div className="my-1 h-px bg-border" />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onSignInClick?.();
                      }}
                      className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      {signInText}
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {/* Main nav */}
            <div className="flex flex-1 items-center gap-6 max-md:justify-between">
              <button
                onClick={(e) => e.preventDefault()}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                <div className="text-2xl">{logo}</div>
                <span className="hidden font-bold text-xl sm:inline-block">
                  shadcn.io
                </span>
              </button>
              {/* Navigation menu */}
              <div className="absolute left-1/2 -translate-x-1/2">
                {!isMobile && (
                  <NavigationMenu>
                    <NavigationMenuList className="flex gap-2">
                      {navigationLinks.map((link) => (
                        <NavigationMenuItem key={link.label}>
                          <NavigationMenuLink
                            href={link.href}
                            onClick={(e) => e.preventDefault()}
                            className="inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-muted-foreground hover:text-primary focus:bg-accent focus:text-accent-foreground"
                          >
                            {link.label}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      ))}
                    </NavigationMenuList>
                  </NavigationMenu>
                )}
              </div>
            </div>
          </div>
          {/* Right side */}
          {!isMobile && (
            <>
              <div>
                {/* Search form */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Input
                    id={searchId}
                    name="search"
                    className="peer h-8 ps-8 pe-2"
                    placeholder={searchPlaceholder}
                    type="search"
                  />
                  <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-2 peer-disabled:opacity-50">
                    <SearchIcon size={16} />
                  </div>
                </form>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSignInClick) onSignInClick();
                  }}
                >
                  {signInText}
                </Button>
              </div>
            </>
          )}
        </div>
      </header>
    );
  }
);

Navbar04.displayName = "Navbar04";

export { Logo, HamburgerIcon };
