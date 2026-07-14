export const sidebarMenu = [
  { section: "Main", items: [
    { label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
  ]},
  { section: "Workflows", items: [
    { label: "Domain Intelligence", icon: "Search", path: "/domain-overview" },
    { label: "Post Generator", icon: "FileText", path: "/post-generator" },
    { label: "Plagiarism & Authenticity", icon: "Shield", path: "/plagiarism-checker" },
  ]},
  { section: "Workspace", items: [
    { label: "Projects", icon: "FolderKanban", path: "/dashboard/projects" },
    { label: "Documents", icon: "File", path: "/dashboard/documents" },
    { label: "Reports", icon: "FileText", path: "/dashboard/reports" },
    { label: "History", icon: "Clock", path: "/dashboard/history" },
  ]},
  { section: "Account", items: [
    { label: "Credits", icon: "Sparkles", path: "/dashboard/credits" },
    { label: "Billing", icon: "CreditCard", path: "/dashboard/billing" },
    { label: "Settings", icon: "Settings", path: "/dashboard/settings" },
  ]},
]

export const quickActions = [
  { label: "Domain Intelligence", icon: "Search", color: "from-violet-500 to-indigo-600" },
  { label: "Generate SEO Post", icon: "FileText", color: "from-blue-500 to-purple-600" },
  { label: "Plagiarism & Authenticity", icon: "FileSearch", color: "from-red-500 to-pink-600" },
]
