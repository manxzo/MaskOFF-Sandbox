import { useContext } from "react";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import clsx from "clsx";
import { ThemeSwitch } from "./theme-switch";
import { siteConfig } from "@/config/site";
import { GlobalConfigContext } from "@/config/GlobalConfig";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/useUser";

export const Navbar = () => {
  const { user } = useContext(GlobalConfigContext)!;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { logout } = useUser();
  // Choose nav items based on authentication state.
  // If logged in, substitute ':userID' with the actual userID.
  const navItems = token && user?.username
    ? siteConfig.authenticatedNavItems.map((item) => ({
        ...item,
        href: item.href.replace(":username", user?.username || ""),
      }))
    : siteConfig.unauthenticatedNavItems;

  // Logout handler.
  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky" className="border-b-2 border-default-500">
      <NavbarContent justify="start">
        <NavbarBrand>
          <Link color="foreground" href="/home">
            <span className="font-bold text-lg">{siteConfig.name}</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="center">
        {navItems.map((item) => (
          <NavbarItem key={item.href}>
            {item.label === "Logout" ? (
              <Button variant="flat" onPress={handleLogout}>
                {item.label}
              </Button>
            ) : (
              <Link
                className={clsx("px-3 py-2", "hover:text-primary")}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            )}
          </NavbarItem>
        ))}
        <ThemeSwitch/>
      </NavbarContent>
    </HeroUINavbar>
  );
};
