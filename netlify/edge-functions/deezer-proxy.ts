const DEEZER_BASE = 'https://api.deezer.com'

// Allowlist of public Deezer endpoints the proxy may forward, preventing the
// function from being abused as an open proxy / SSRF vector.
const ALLOWED_ENDPOINT =
  /^\/(?:search(?:\/[a-z]*)?|track|album|artist|playlist|radio|genre|chart|user(?:\/[0-9]+(?:\/[a-z]+)?|\/me)?|editorial|mix)(?:\/[0-9]+(?:\/[a-z]+)?)?$/

const BLOCKED_FRAGMENTS = ['.', '@', '//', '%']

function isValidEndpoint(endpoint: string): boolean {
  if (!endpoint.startsWith('/')) return false
  if (BLOCKED_FRAGMENTS.some((fragment) => endpoint.includes(fragment))) return false
  return ALLOWED_ENDPOINT.test(endpoint)
}

function json(headers: Headers, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers })
}

export default async function deezerProxy(
  request: Request,
): Promise<Response> {
  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? '*'

  const headers = new Headers({
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=300, s-maxage=300',
  })

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (request.method !== 'GET') {
    return json(headers, 405, {
      error: { message: 'Method not allowed', code: 405 },
    })
  }

  const url = new URL(request.url)
  const endpoint = (url.searchParams.get('endpoint') ?? '').trim()

  if (!isValidEndpoint(endpoint)) {
    return json(headers, 400, {
      error: { message: 'Invalid or unsupported endpoint', code: 400 },
    })
  }

  const query = new URLSearchParams()
  url.searchParams.forEach((value, key) => {
    if (key !== 'endpoint' && value !== '' && value != null) {
      query.set(key, value)
    }
  })
  const queryString = query.toString()
  const upstreamUrl = `${DEEZER_BASE}${endpoint}${queryString ? `?${queryString}` : ''}`

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: { 'user-agent': 'Spotinder/1.0' },
    })
    const text = await upstream.text()
    const isJson =
      upstream.headers.get('content-type')?.includes('application/json') ?? false

    return new Response(
      isJson
        ? text
        : JSON.stringify({
            error: {
              message: text || `Upstream error ${upstream.status}`,
              code: upstream.status,
            },
          }),
      { status: upstream.status, headers },
    )
  } catch {
    return json(headers, 502, {
      error: { message: 'Upstream request failed', code: 502 },
    })
  }
}