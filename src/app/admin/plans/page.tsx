"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit3, Check, X, Users, CreditCard } from "lucide-react"

const samplePlans = [
  {
    id: 1, name: "Free", slug: "free", price: 0, description: "Perfect for getting started",
    features: ["1 Project", "5,000 Credits/mo", "Basic AI Tools", "Community Support"],
    activeUsers: 12450, color: "from-[#A7B0C0] to-[#666]",
  },
  {
    id: 2, name: "Pro", slug: "pro", price: 49, description: "Best for professionals",
    features: ["10 Projects", "50,000 Credits/mo", "All AI Tools", "Priority Support", "API Access", "Custom Models"],
    activeUsers: 5670, color: "from-[#6D5EF5] to-[#8B5CF6]",
  },
  {
    id: 3, name: "Enterprise", slug: "enterprise", price: 199, description: "For large teams",
    features: ["Unlimited Projects", "500,000 Credits/mo", "All AI Tools", "24/7 Support", "API Access", "Custom Models", "Dedicated Server", "SSO", "Custom Integrations"],
    activeUsers: 890, color: "from-[#F59E0B] to-[#EF4444]",
  },
]

export default function PlansPage() {
  const [plans] = useState(samplePlans)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">Manage subscription plans and pricing</p>
        </div>
        <button className="h-10 px-4 rounded-xl bg-gradient-to-br from-[#6D5EF5] to-[#8B5CF6] text-white text-xs font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-[#6D5EF5]/20">
          <Plus className="w-4 h-4" /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl p-6 hover:border-white/[0.12] transition-all relative overflow-hidden"
          >
            {plan.price === 0 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-medium text-[#22C55E]">
                Free
              </div>
            )}
            {plan.price === 199 && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[10px] font-medium text-[#F59E0B]">
                Popular
              </div>
            )}

            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
              <CreditCard className="w-6 h-6 text-white" />
            </div>

            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold text-white">${plan.price}</span>
              <span className="text-sm text-[#A7B0C0]">/month</span>
            </div>
            <p className="text-xs text-[#A7B0C0] mt-2">{plan.description}</p>

            <div className="mt-6 space-y-3">
              {plan.features.map((f, fi) => (
                <div key={fi} className="flex items-center gap-2.5">
                  {plan.price === 0 && fi >= 3 ? (
                    <X className="w-4 h-4 text-[#EF4444] shrink-0" />
                  ) : (
                    <Check className="w-4 h-4 text-[#22C55E] shrink-0" />
                  )}
                  <span className="text-xs text-[#A7B0C0]">{f}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#A7B0C0]">
                <Users className="w-3.5 h-3.5" />
                {plan.activeUsers.toLocaleString()} active
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
