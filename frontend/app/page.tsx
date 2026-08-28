async function getHealth() {
  try {
    const res = await fetch("http://localhost:8000/api/health", { cache: "no-store" })
    return await res.json()
  } catch {
    return { status: "backend not reachable (expected until docker up)" }
  }
}

export default async function Page() {
  const health = await getHealth()
  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>ANVĪKṢA — Phase 1 Scaffold + Schema Freeze</h1>
      <p style={{ color: "#8A919C", marginBottom: 16 }}>Backend contract: GET /api/health → schema-frozen DB (22 tables). No UI work per Phases.md — contracts only.</p>
      <pre style={{ background: "#12151A", border: "1px solid #242A32", padding: 16, borderRadius: 8, fontSize: 12 }}>
        /api/health → {JSON.stringify(health, null, 2)}
      </pre>
      <p style={{ marginTop: 16, fontSize: 12, color: "#8A919C" }}>Next: enable Postgres/Redis, apply Alembic migration, verify /api/ready.</p>
    </div>
  )
}
