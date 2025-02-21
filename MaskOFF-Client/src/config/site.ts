// src/config/site.ts
export const siteConfig = {
  name: "MASKoff",
  description: "A full-stack job platform with community engagement and direct messaging.",
  
  // Navigation for users who are NOT logged in.
  unauthenticatedNavItems: [
    { label: "Home", href: "/home" },
    { label: "Register", href: "/register" },
    { label: "Login", href: "/login" }
  ],

  // Navigation for logged-in users.
  // The ':userID' portion should be dynamically replaced in your routing or client state.
  authenticatedNavItems: [
    { label: "Dashboard", href: "/:username/dashboard" },
    { label: "Posts", href: "/:username/posts" },
    { label: "Find Users", href: "/:username/find-users" },
    { label: "Friend List", href: "/:username/friends" },
    { label: "Messages", href: "/:username/messages" },
    { label: "Profile", href: "/:username/profile" },
    { label: "Logout", href: "/logout" }
  ]
};