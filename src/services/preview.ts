import { useCallback, useEffect, useState } from 'react'

// Single shared preview player: only one 30s Deezer preview plays at a time.
// Every play builds a fresh <audio> element with an explicit load, so replays
// of the same track always restart cleanly (avoids ended/readiness states).
let active: HTMLAudioElement | null = null
let activeId: number | null = null
const subscribers = new Set<() => void>()

function notify() {
  for (const listener of subscribers) listener()
}

export function subscribePreview(listener: () => void) {
  subscribers.add(listener)
  return () => {
    subscribers.delete(listener)
  }
}

export function getActivePreviewId(): number | null {
  return activeId
}

export function isPreviewPaused(): boolean {
  return activeId !== null && active !== null && active.paused
}

function clearActive() {
  if (active) {
    active.pause()
    active.onended = null
    active.onerror = null
    active.removeAttribute('src')
    active.load()
    active = null
  }
  activeId = null
}

export function stopPreview() {
  clearActive()
  notify()
}

export function playPreview(id: number, url: string) {
  clearActive()
  if (!url) {
    notify()
    return
  }
  const audio = new Audio()
  audio.preload = 'auto'
  const teardown = () => {
    if (active === audio) {
      active = null
      activeId = null
      notify()
    }
  }
  audio.onended = teardown
  audio.onerror = teardown
  active = audio
  activeId = id
  audio.src = url
  void audio.play().catch(teardown)
  notify()
}

export function togglePreview(id: number, url: string) {
  if (activeId === id && active) {
    if (active.paused) {
      // Resume a paused preview.
      void active.play().then(notify).catch(clearActive)
      return
    }
    // Clicking the playing track pauses it.
    clearActive()
    notify()
    return
  }
  // Fresh play — this also restarts a track whose preview already ended.
  playPreview(id, url)
}

export function usePreview(trackId: number, url: string) {
  const [playing, setPlaying] = useState(() => getActivePreviewId() === trackId)
  const toggle = useCallback(() => togglePreview(trackId, url), [trackId, url])

  useEffect(
    () =>
      subscribePreview(() => {
        setPlaying(getActivePreviewId() === trackId && !isPreviewPaused())
      }),
    [trackId],
  )

  return { playing, toggle }
}