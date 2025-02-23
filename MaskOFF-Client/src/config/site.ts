export const siteConfig = {
  name: "MASKoff",
  description: "A full-stack job platform with community engagement and direct messaging.",
  
  // Navigation for unauthenticated users.
  unauthenticatedNavItems: [
    { label: "Login/Register", link: "/#" },
  ],

  // Navigation for authenticated users.
  // The ':username' placeholder will be replaced with the actual username.
  authenticatedNavItems: [
    { label: "Dashboard", link: "/dashboard" },
    { label: "Posts", link: "/posts" },
    { label: "Friends", link: "/friends" },
    { label: "Messages", link: "/messages" },
    { label: "Profile", link: "/profile" },
    { label: "Logout", link: "/logout" }
  ]
};
