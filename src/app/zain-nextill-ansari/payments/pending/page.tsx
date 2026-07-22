"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  AlertTriangle,
  CreditCard,
  RefreshCw,
} from "lucide-react"

interface PendingPayment {
  id: string
  user_id: string
  user_email: string | null
  user_name: string | null
  plan_slug: string
  amount: number
  final_amount: number | null
  discount_amount: number | null
  provider: string
  provider_transaction_id: string | null
  verification_status: string
  billing_cycle: string
  created_at: string
}

const providerLabels: Record<string, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  jazzcash: "JazzCash",
  easypaisa: "EasyPaisa",
  payoneer: "Payoneer",
  bank_transfer: "Bank Transfer",
  crypto: "Crypto",
}

const REFRESH_INTERVAL = 20000 // 20 seconds

export default function PendingPaymentsPage() {
  const [payments, setPayments] = useState<PendingPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectPaymentId, setRejectPaymentId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rejecting, setRejecting] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payments/pending")
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setPayments(data)
      } else if (data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load pending payments")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPayments()
    intervalRef.current = setInterval(fetchPayments, REFRESH_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchPayments])

  const handleApprove = async (id: string) => {
    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/payments/${id}/approve`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to approve")
      await fetchPayments()
    } catch (err: any) {
      setError(err.message || "Failed to approve payment")
    } finally {
      setProcessingId(null)
    }
  }

  const openRejectModal = (id: string) => {
    setRejectPaymentId(id)
    setRejectReason("")
    setRejectModalOpen(true)
  }

  const handleReject = async () => {
    if (!rejectPaymentId || !rejectReason.trim()) return
    setRejecting(true)
    try {
      const res = await fetch(`/api/admin/payments/${rejectPaymentId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to reject")
      setRejectModalOpen(false)
      setRejectPaymentId(null)
      setRejectReason("")
      await fetchPayments()
    } catch (err: any) {
      setError(err.message || "Failed to reject payment")
    } finally {
      setRejecting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "--"
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pending Payments</h1>
          <p className="text-sm text-[#A7B0C0] mt-1">
            Review and approve manual payment verifications
          </p>
        </div>
        <button
          onClick={() => {
            setLoading(true)
            fetchPayments()
          }}
          className="h-10 px-4 rounded-xl bg-[#151C2E]/80 border border-white/[0.06] text-xs text-[#A7B0C0] hover:text-white flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 text-xs text-[#A7B0C0]">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>{payments.length} pending</span>
        </div>
        <span className="text-white/[0.1]">|</span>
        <span>Auto-refreshes every 20s</span>
      </div>

      {/* Table */}
      <div className="bg-[#151C2E]/80 backdrop-blur-xl border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">
                  User
                </th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">
                  Plan
                </th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="text-left p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">
                  Submitted
                </th>
                <th className="text-right p-4 text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <Loader2 className="w-6 h-6 text-[#6D5EF5] animate-spin mx-auto" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#EF4444]">
                    {error}
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-[#22C55E]" />
                      </div>
                      <p className="text-sm text-white font-medium">No pending payments</p>
                      <p className="text-xs text-[#A7B0C0]">
                        All payment verifications have been reviewed.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* User */}
                    <td className="p-4">
                      <p className="text-sm text-white">
                        {p.user_name || "Unknown"}
                      </p>
                      <p className="text-[11px] text-[#A7B0C0]">
                        {p.user_email || "--"}
                      </p>
                    </td>

                    {/* Plan */}
                    <td className="p-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium border bg-[#6D5EF5]/10 text-[#6D5EF5] border-[#6D5EF5]/20">
                        {p.plan_slug || "--"}
                      </span>
                      <span className="text-[10px] text-[#A7B0C0] ml-1.5">
                        {p.billing_cycle}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="p-4">
                      <span className="text-sm font-bold text-white">
                        ${Number(p.final_amount ?? p.amount).toFixed(2)}
                      </span>
                      {p.discount_amount && Number(p.discount_amount) > 0 && (
                        <p className="text-[10px] text-[#22C55E]">
                          -${Number(p.discount_amount).toFixed(2)} discount
                        </p>
                      )}
                    </td>

                    {/* Payment Method */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#A7B0C0]" />
                        <span className="text-xs text-white">
                          {providerLabels[p.provider] || p.provider}
                        </span>
                      </div>
                    </td>

                    {/* Transaction ID */}
                    <td className="p-4">
                      <span className="text-xs font-mono text-[#4CC9F0]">
                        {p.provider_transaction_id
                          ? p.provider_transaction_id.length > 16
                            ? `${p.provider_transaction_id.slice(0, 16)}...`
                            : p.provider_transaction_id
                          : "--"}
                      </span>
                    </td>

                    {/* Submitted */}
                    <td className="p-4 text-xs text-[#A7B0C0]">
                      {formatDate(p.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={processingId === p.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/20 disabled:opacity-50 transition-all"
                        >
                          {processingId === p.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3 h-3" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(p.id)}
                          disabled={processingId === p.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444]/20 disabled:opacity-50 transition-all"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (!rejecting) {
                setRejectModalOpen(false)
                setRejectPaymentId(null)
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#151C2E] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Reject Payment</h3>
                    <p className="text-[11px] text-[#A7B0C0]">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!rejecting) {
                      setRejectModalOpen(false)
                      setRejectPaymentId(null)
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-[#A7B0C0] hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <label className="block mb-4">
                <span className="text-[11px] font-medium text-[#A7B0C0] uppercase tracking-wider">
                  Rejection Reason
                </span>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejecting this payment..."
                  rows={3}
                  className="mt-1.5 w-full px-3 py-2.5 rounded-xl bg-[#0D1220] border border-white/[0.06] text-white text-xs placeholder:text-[#A7B0C0]/40 focus:outline-none focus:ring-2 focus:ring-[#EF4444]/30 transition-all resize-none"
                />
              </label>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setRejectModalOpen(false)
                    setRejectPaymentId(null)
                  }}
                  disabled={rejecting}
                  className="px-4 py-2 rounded-xl text-xs text-[#A7B0C0] hover:text-white border border-white/[0.06] hover:bg-white/[0.06] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejecting || !rejectReason.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-[#EF4444] text-white hover:bg-[#EF4444]/80 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {rejecting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  Reject Payment
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg backdrop-blur-xl"
          >
            <p className="text-xs text-[#EF4444]">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-[#EF4444] hover:text-white transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
