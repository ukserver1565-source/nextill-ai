export const sidebarMenu = [
  { section: "Main", items: [
    { label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
  ]},
  { section: "Workflows", items: [
    { label: "Keyword Intelligence", icon: "Search", path: "/keyword-intelligence" },
    { label: "Post Generator", icon: "FileText", path: "/post-generator" },
    { label: "Plagiarism Checker", icon: "Shield", path: "/plagiarism-checker" },
  ]},
  { section: "Workspace", items: [
    { label: "Projects", icon: "FolderKanban", path: "/dashboard/projects" },
    { label: "Documents", icon: "File", path: "/dashboard/documents" },
    { label: "History", icon: "Clock", path: "/dashboard/history" },
  ]},
  { section: "Account", items: [
    { label: "Credits", icon: "Sparkles", path: "/dashboard/credits" },
    { label: "Billing", icon: "CreditCard", path: "/dashboard/billing" },
    { label: "Settings", icon: "Settings", path: "/dashboard/settings" },
  ]},
]

export const quickActions = [
  { label: "Keyword Intelligence", icon: "Search", color: "from-violet-500 to-indigo-600" },
  { label: "Generate SEO Post", icon: "FileText", color: "from-blue-500 to-purple-600" },
  { label: "Check Plagiarism", icon: "FileSearch", color: "from-red-500 to-pink-600" },
]
