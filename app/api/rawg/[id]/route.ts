import { NextRequest, NextResponse } from "next/server";

const RAWG_API_KEY = process.env.RAWG_API_KEY?.trim();
const RAWG_BASE = "https://api.rawg.io/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!RAWG_API_KEY) {
    return NextResponse.json(
      { error: "RAWG_API_KEY não configurado no servidor." },
      { status: 500 }
    );
  }

  const keyParam = `key=${RAWG_API_KEY}`;

  try {
    const [detailsRes, screenshotsRes, moviesRes] = await Promise.all([
      fetch(`${RAWG_BASE}/games/${id}?${keyParam}`, {
        headers: { "User-Agent": "Sletter/1.0" },
      }),
      fetch(`${RAWG_BASE}/games/${id}/screenshots?${keyParam}`, {
        headers: { "User-Agent": "Sletter/1.0" },
      }),
      fetch(`${RAWG_BASE}/games/${id}/movies?${keyParam}`, {
        headers: { "User-Agent": "Sletter/1.0" },
      }),
    ]);

    if (!detailsRes.ok) {
      return NextResponse.json(
        { error: "Jogo não encontrado na RAWG." },
        { status: detailsRes.status }
      );
    }

    const [details, screenshots, movies] = await Promise.all([
      detailsRes.json(),
      screenshotsRes.ok ? screenshotsRes.json() : { results: [] },
      moviesRes.ok ? moviesRes.json() : { results: [] },
    ]);

    return NextResponse.json({
      details,
      screenshots: (screenshots.results || []).slice(0, 20),
      movies: (movies.results || []).slice(0, 10),
    });
  } catch (error) {
    console.error("Erro ao buscar dados da RAWG:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar dados da RAWG." },
      { status: 500 }
    );
  }
}
