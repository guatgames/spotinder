export interface DeezerArtist {
  id: number
  name: string
  picture?: string
  picture_small?: string
  picture_medium?: string
  picture_big?: string
  picture_xl?: string
  tracklist?: string
}

export interface DeezerAlbum {
  id: number
  title: string
  cover?: string
  cover_small?: string
  cover_medium?: string
  cover_big?: string
  cover_xl?: string
  release_date?: string
  tracklist?: string
}

export interface DeezerTrack {
  id: number
  title: string
  title_short?: string
  duration: number
  rank?: number
  explicit_lyrics: boolean
  preview: string
  link: string
  artist: DeezerArtist
  album: DeezerAlbum
  bpm?: number
}

export interface DeezerPlaylist {
  id: number
  title: string
  picture?: string
  picture_small?: string
  picture_medium?: string
  picture_big?: string
  picture_xl?: string
  nb_tracks?: number
  tracklist?: string
  fans?: number
}

export interface DeezerAlbumPage extends DeezerAlbum {
  nb_tracks?: number
  artist?: DeezerArtist
  tracks?: { data: DeezerTrack[]; total?: number }
}

export interface DeezerArtistPage extends DeezerArtist {
  nb_fan?: number
  nb_album?: number
  top_tracks?: { data: DeezerTrack[]; total?: number }
}

export interface DeezerSearchResponse {
  data: DeezerTrack[]
  total: number
  next?: string
}

export interface DeezerChartTracks {
  data: DeezerTrack[]
  total: number
  prev?: string
  next?: string
}

export interface DeezerChartResponse {
  tracks: DeezerChartTracks
  albums?: { data: DeezerAlbum[]; total?: number }
  artists?: { data: DeezerArtist[]; total?: number }
  playlists?: { data: DeezerPlaylist[]; total?: number }
}

export interface DeezerSuggestionsResponse {
  order: string[]
  data: DeezerTrack[]
}

export interface DeezerError {
  type?: string
  message: string
  code: number
}

export interface DeezerErrorBody {
  error: DeezerError
}