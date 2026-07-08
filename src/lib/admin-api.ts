const BASE = "/api/admin"

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `API error: ${res.status}`)
  }
  return res.json()
}

export const adminApi = {
  overview: () => fetchJson<any>(`${BASE}/overview`),
  users: (params?: Record<string, string>) => fetchJson<any>(`${BASE}/users?${new URLSearchParams(params || {})}`),
  user: (id: string) => fetchJson<any>(`${BASE}/users/${id}`),
  updateUser: (id: string, data: any) => fetchJson<any>(`${BASE}/users/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteUser: (id: string) => fetchJson<any>(`${BASE}/users/${id}`, { method: "DELETE" }),
  plans: () => fetchJson<any[]>(`${BASE}/plans`),
  plan: (id: string) => fetchJson<any>(`${BASE}/plans/${id}`),
  createPlan: (data: any) => fetchJson<any>(`${BASE}/plans`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  updatePlan: (id: string, data: any) => fetchJson<any>(`${BASE}/plans/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deletePlan: (id: string) => fetchJson<any>(`${BASE}/plans/${id}`, { method: "DELETE" }),
  payments: (params?: Record<string, string>) => fetchJson<any>(`${BASE}/payments?${new URLSearchParams(params || {})}`),
  credits: (params?: Record<string, string>) => fetchJson<any>(`${BASE}/credits?${new URLSearchParams(params || {})}`),
  addCredits: (data: any) => fetchJson<any>(`${BASE}/credits`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  tools: () => fetchJson<any[]>(`${BASE}/tools`),
  updateTool: (id: string, data: any) => fetchJson<any>(`${BASE}/tools/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  models: () => fetchJson<any[]>(`${BASE}/models`),
  updateModel: (id: string, data: any) => fetchJson<any>(`${BASE}/models/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  projects: (params?: Record<string, string>) => fetchJson<any>(`${BASE}/projects?${new URLSearchParams(params || {})}`),
  blogPosts: (params?: Record<string, string>) => fetchJson<any>(`${BASE}/blog?${new URLSearchParams(params || {})}`),
  blogPost: (id: string) => fetchJson<any>(`${BASE}/blog/${id}`),
  createBlogPost: (data: any) => fetchJson<any>(`${BASE}/blog`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  updateBlogPost: (id: string, data: any) => fetchJson<any>(`${BASE}/blog/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteBlogPost: (id: string) => fetchJson<any>(`${BASE}/blog/${id}`, { method: "DELETE" }),
  coupons: () => fetchJson<any[]>(`${BASE}/coupons`),
  createCoupon: (data: any) => fetchJson<any>(`${BASE}/coupons`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  updateCoupon: (id: string, data: any) => fetchJson<any>(`${BASE}/coupons/${id}`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  deleteCoupon: (id: string) => fetchJson<any>(`${BASE}/coupons/${id}`, { method: "DELETE" }),
  contact: (params?: Record<string, string>) => fetchJson<any>(`${BASE}/contact?${new URLSearchParams(params || {})}`),
  markContactRead: (id: string) => fetchJson<any>(`${BASE}/contact/${id}`, { method: "PATCH" }),
  deleteContact: (id: string) => fetchJson<any>(`${BASE}/contact/${id}`, { method: "DELETE" }),
  settings: () => fetchJson<any>(`${BASE}/settings`),
  updateSettings: (data: any) => fetchJson<any>(`${BASE}/settings`, { method: "PATCH", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }),
  health: () => fetchJson<any>(`${BASE}/health`),
  securityLogs: (params?: Record<string, string>) => fetchJson<any>(`${BASE}/security?${new URLSearchParams(params || {})}`),
  apiKeys: () => fetchJson<any[]>(`${BASE}/api-keys`),
  deleteApiKey: (id: string) => fetchJson<any>(`${BASE}/api-keys/${id}`, { method: "DELETE" }),
  documents: (params?: Record<string, string>) => fetchJson<any>(`${BASE}/documents?${new URLSearchParams(params || {})}`),
}
