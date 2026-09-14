import type {
  DeezerAlbum,
  DeezerAlbumPage,
  DeezerArtist,
  DeezerArtistPage,
  DeezerChartResponse,
  DeezerErrorBody,
  DeezerSearchResponse,
  DeezerSuggestionsResponse,
  DeezerTrack,
} from '../types/deezer'

const PROXY_BASE =
  (import.meta.env.VITE_DEEZER_PROXY_BASE as string | undefined) ??
  '/.netlify/functions/deezer-proxy'

export class DeezerError extends Error {
  readonly code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'DeezerError'
    this.code = code
  }
}

interface ProxyCallOptions {
  endpoint: string
  params?: Record<string, string | number | boolean | undefined>
}

async function proxy<T>({ endpoint, params }: ProxyCallOptions): Promise<T> {
  const query = new URLSearchParams()
  query.set('endpoint', endpoint)
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value == null || value === '') continue
    query.set(key, String(value))
  }

  const response = await fetch(`${PROXY_BASE}?${query.toString()}`)
  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const errorBody = body as DeezerErrorBody | null
    throw new DeezerError(
      errorBody?.error?.message ?? `Request failed with ${response.status}`,
      errorBody?.error?.code ?? response.status,
    )
  }

  return body as T
}

export const deezer = {
  searchTracks: (query: string, limit = 30) =>
    proxy<DeezerSearchResponse>({
      endpoint: '/search/track',
      params: { q: query, limit, order: 'RANKING' },
    }),

  searchAlbums: (query: string, limit = 30) =>
    proxy<{ data: DeezerAlbum[]; total: number }>({
      endpoint: '/search/album',
      params: { q: query, limit },
    }),

  searchArtists: (query: string, limit = 30) =>
    proxy<{ data: DeezerArtist[]; total: number }>({
      endpoint: '/search/artist',
      params: { q: query, limit },
    }),

  getTrack: (id: number) => proxy<DeezerTrack>({ endpoint: `/track/${id}` }),

  getAlbum: (id: number) =>
    proxy<DeezerAlbumPage>({ endpoint: `/album/${id}` }),

  getArtist: (id: number) =>
    proxy<DeezerArtistPage>({ endpoint: `/artist/${id}` }),

  getArtistTopTracks: (id: number, limit = 50) =>
    proxy<{ data: DeezerTrack[] }>({
      endpoint: `/artist/${id}/top`,
      params: { limit },
    }),

  getCharts: (limit = 50) =>
    proxy<DeezerChartResponse>({
      endpoint: '/chart/0',
      params: {
        tracks_limit: limit,
        albums_limit: limit,
        artists_limit: limit,
        playlists_limit: limit,
      },
    }),

  getSuggestions: (query: string, limit = 8) =>
    proxy<DeezerSuggestionsResponse>({
      endpoint: '/search/track',
      params: { q: query, limit },
    }),
}