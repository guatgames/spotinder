import type { Handler } from '@netlify/functions'

const DEEZER_BASE = 'https://api.deezer.com'

// Allowlist of public Deezer endpoints the proxy may forward. This prevents
// the function from being abused as an open proxy / SSRF vector.
const ALLOWED_ENDPOINT =
  /^\/(?:search(?:\/[a-z]*)?|track|album|artist|playlist|radio|genre|chart|user(?:\/[0-9]+(?:\/[a-z]+)?|\/me)?|editorial|mix)(?:\/[0-9]+(?:\/[a-z]+)?)?$/

const BLOCKED_FRAGMENTS = ['.', '@', '//', '%', '\\']

interface ProxyParams {
  endpoint: string
  query: Record<string, string>
}

export function buildUpstreamUrl({ endpoint, query }: ProxyParams): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    qs.set(key, value)
  }
  const encoded = qs.toString()
  return `${DEEZER_BASE}${endpoint}${encoded ? `?${encoded}` : ''}`
}

export function isValidEndpoint(endpoint: string): boolean {
  if (!endpoint.startsWith('/')) return false
  if (BLOCKED_FRAGMENTS.some((fragment) => endpoint.includes(fragment))) return false
  return ALLOWED_ENDPOINT.test(endpoint)
}

export function extractEndpoint(raw?: string | null): string {
  return (raw ?? '').replace(/[?#].*$/, '').trim()
}

const json = (statusCode: number, body: unknown, headers: Record<string, string>) => ({
  statusCode,
  headers,
  body: JSON.stringify(body),
})

export const handler: Handler = async (event) => {
  const origin = process.env.ALLOWED_ORIGIN ?? '*'

  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=300, s-maxage=300',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return json(
      405,
      { error: { message: 'Method not allowed', code: 405 } },
      headers,
    )
  }

  const params = event.queryStringParameters ?? {}
  const endpoint = extractEndpoint(params.endpoint)

  if (!isValidEndpoint(endpoint)) {
    return json(
      400,
      { error: { message: 'Invalid or unsupported endpoint', code: 400 } },
      headers,
    )
  }

  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (key === 'endpoint' || value == null || value === '') continue
    query[key] = value
  }

  const url = buildUpstreamUrl({ endpoint, query })

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Spotinder/1.0' },
    })
    const text = await upstream.text()
    const isJson = (upstream.headers.get('content-type') ?? '').includes(
      'application/json',
    )

    return {
      statusCode: upstream.status,
      headers,
      body: isJson
        ? text
        : JSON.stringify({
            error: { message: text || `Upstream error ${upstream.status}`, code: upstream.status },
          }),
    }
  } catch {
    return json(
      502,
      { error: { message: 'Upstream request failed', code: 502 } },
      headers,
    )
  }
}