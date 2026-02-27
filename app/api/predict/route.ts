import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const params = new URLSearchParams()
  for (const key of ["make", "model", "year", "mileage", "condition", "region"]) {
    const v = sp.get(key)
    if (v) params.set(key, v)
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/predict?${params.toString()}`, {
      signal: AbortSignal.timeout(30_000),
    })

    if (!res.ok) {
      const body = await res.text()
      return NextResponse.json(
        { error: body || `Backend returned ${res.status}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown error"

    const isConnection =
      message.includes("ECONNREFUSED") ||
      message.includes("fetch failed") ||
      message.includes("TimeoutError") ||
      message.includes("abort")

    if (isConnection) {
      return NextResponse.json(
        {
          error:
            "Backend service is not reachable. Make sure the FastAPI server is running and NEXT_PUBLIC_API_URL is set correctly.",
        },
        { status: 503 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
