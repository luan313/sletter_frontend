import { NextRequest, NextResponse } from "next/server";

const TMDB_TOKEN = process.env.TMDB_TOKEN?.trim();
const TMDB_BASE = "https://api.themoviedb.org/3";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  if (!TMDB_TOKEN) {
    return NextResponse.json(
      { error: "TMDB_TOKEN não configurado no servidor." },
      { status: 500 }
    );
  }

  if (type !== "movie" && type !== "tv") {
    return NextResponse.json(
      { error: "Tipo inválido. Use 'movie' ou 'tv'." },
      { status: 400 }
    );
  }

  const headers = {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    accept: "application/json",
  };

  try {
    const [detailsRes, imagesRes, videosRes] = await Promise.all([
      fetch(`${TMDB_BASE}/${type}/${id}?language=pt-BR`, { headers }),
      fetch(`${TMDB_BASE}/${type}/${id}/images`, { headers }),
      fetch(`${TMDB_BASE}/${type}/${id}/videos?language=pt-BR`, { headers }),
    ]);

    if (!detailsRes.ok) {
      return NextResponse.json(
        { error: "Mídia não encontrada no TMDB." },
        { status: detailsRes.status }
      );
    }

    const [details, images, videos] = await Promise.all([
      detailsRes.json(),
      imagesRes.ok ? imagesRes.json() : { backdrops: [], posters: [] },
      videosRes.ok ? videosRes.json() : { results: [] },
    ]);

    return NextResponse.json({
      details,
      images: {
        backdrops: (images.backdrops || []).slice(0, 20),
        posters: (images.posters || []).slice(0, 10),
      },
      videos: (videos.results || []).filter(
        (v: any) => v.site === "YouTube"
      ).slice(0, 10),
    });
  } catch (error) {
    console.error("Erro ao buscar dados do TMDB:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar dados do TMDB." },
      { status: 500 }
    );
  }
}
