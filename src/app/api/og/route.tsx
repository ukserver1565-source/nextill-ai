import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #090B16 0%, #111827 50%, #0C1125 100%)",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "linear-gradient(135deg, #6D5EF5, #8B5CF6)",
            marginBottom: 30,
            boxShadow: "0 0 40px rgba(109, 94, 245, 0.3)",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          Nextill AI
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#A7B0C0",
            textAlign: "center",
            lineHeight: 1.4,
            maxWidth: 600,
          }}
        >
          AI-Powered SEO Tools & Content Platform
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 30,
          }}
        >
          {["Keyword Research", "Post Generator", "Plagiarism Checker"].map((tool) => (
            <div
              key={tool}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(109, 94, 245, 0.3)",
                background: "rgba(109, 94, 245, 0.1)",
                color: "#8B7BF7",
                fontSize: 14,
              }}
            >
              {tool}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
