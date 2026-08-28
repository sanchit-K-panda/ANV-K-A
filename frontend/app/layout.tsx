export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#0B0D10", color: "#E8EAED", fontFamily: "Inter, system-ui, sans-serif", margin: 0 }}>
        <div style={{ borderBottom: "1px solid #242A32", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>ANVĪKṢA</strong>
          <span style={{ fontSize: 12, opacity: 0.8 }}>● LOCAL / OFFLINE — Phase 1 Scaffold</span>
        </div>
        <main style={{ padding: 24 }}>{children}</main>
      </body>
    </html>
  )
}
