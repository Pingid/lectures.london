/** Browser-like headers so sites don't reject the scraper as an unknown bot. */
export const browserHeaders: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-GB,en;q=0.9',
  From: 'lectures.london',
  'X-Bot-Name': 'LecturesLondonScraperBot',
  'X-Bot-Version': '1.0',
}

export interface RetryOptions {
  retries?: number
  backoffMs?: number
}

/** Fetch with browser headers and exponential backoff on 429/5xx responses. */
export const request = async (url: string, init: RequestInit = {}, opts: RetryOptions = {}): Promise<Response> => {
  const { retries = 3, backoffMs = 500 } = opts
  const headers = { ...browserHeaders, ...init.headers }
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { ...init, headers }).catch((e) => (attempt >= retries ? Promise.reject(e) : null))
    if (res && (res.ok || (res.status !== 429 && res.status < 500))) return res
    if (attempt >= retries) return res as Response
    await new Promise((r) => setTimeout(r, backoffMs * 2 ** attempt))
  }
}
