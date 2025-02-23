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
    { label: "Dashboard", href: "/:username/dashboard" },
    { label: "Posts", href: "/:username/posts" },
    { label: "Find Users", href: "/:username/find-users" },
    { label: "Friend List", href: "/friends" },
    { label: "Messages", href: "/:username/messages" },
    { label: "Profile", href: "/:username/profile" },
    { label: "Logout", href: "/logout" }
  ]
};
