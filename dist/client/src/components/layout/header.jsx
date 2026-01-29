import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/PHW_denverLogo1_transparent_1768667042398.png";
export function Header() {
    var location = useLocation()[0];
    var _a = useState(false), mobileMenuOpen = _a[0], setMobileMenuOpen = _a[1];
    var navLinks = [
        { href: "/", label: "Home" },
        { href: "/events", label: "Events" },
        { href: "/programs", label: "Programs" },
        { href: "/trips", label: "Trips" },
        { href: "/register", label: "Join Us" },
    ];
    var isActive = function (href) {
        if (href === "/")
            return location === "/";
        return location.startsWith(href);
    };
    return (<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img src={logoImage} alt="Project Healing Waters" className="h-10 w-auto"/>
          <span className="text-lg font-semibold" data-testid="text-logo">Project Healing Waters - DENVER</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(function (link) { return (<Link key={link.href} href={link.href}>
              <Button variant={isActive(link.href) ? "secondary" : "ghost"} size="sm" data-testid={"link-nav-".concat(link.label.toLowerCase())}>
                {link.label}
              </Button>
            </Link>); })}
          <div className="ml-4 pl-4 border-l">
            <Link href="/admin">
              <Button variant="outline" size="sm" data-testid="link-admin">
                Admin
              </Button>
            </Link>
          </div>
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={function () { return setMobileMenuOpen(!mobileMenuOpen); }} data-testid="button-mobile-menu">
          {mobileMenuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
        </Button>
      </div>

      {mobileMenuOpen && (<div className="md:hidden border-t bg-background">
          <nav className="container mx-auto flex flex-col p-4 gap-2">
            {navLinks.map(function (link) { return (<Link key={link.href} href={link.href}>
                <Button variant={isActive(link.href) ? "secondary" : "ghost"} className="w-full justify-start" onClick={function () { return setMobileMenuOpen(false); }} data-testid={"link-mobile-nav-".concat(link.label.toLowerCase())}>
                  {link.label}
                </Button>
              </Link>); })}
            <div className="pt-2 mt-2 border-t">
              <Link href="/admin">
                <Button variant="outline" className="w-full" onClick={function () { return setMobileMenuOpen(false); }} data-testid="link-mobile-admin">
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </nav>
        </div>)}
    </header>);
}
