export const siteConfig = {
  name: "MASKoff",
  description: "A full-stack job platform with community engagement and direct messaging.",
  
  // Navigation for unauthenticated users.
  unauthenticatedNavItems: [
    { label: "Login/Register", href: "/#" },
  ],

  // Navigation for authenticated users.
  // The ':username' placeholder will be replaced with the actual username.
  authenticatedNavItems: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Posts", href: "/posts" },
    { label: "Friends", href: "/friends" },
    { label: "Messages", href: "/messages" },
    { label: "Profile", href: "/profile" },
    { label: "Logout", href: "/logout" }
  ]
};
