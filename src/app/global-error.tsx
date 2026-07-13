"use client"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#090B16] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Critical Error</h1>
            <p className="text-sm text-gray-400 mb-6">The application encountered a critical error. Please try refreshing the page.</p>
            <button onClick={reset} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D5EF5] text-white font-semibold text-sm hover:opacity-90 transition-all">
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
