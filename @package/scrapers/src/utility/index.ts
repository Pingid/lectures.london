import { parseDate, parse } from 'chrono-node'
import { parseDocument } from 'htmlparser2'
import sanitize from 'sanitize-html'
import { textContent } from 'domutils'
import type { Context } from '@package/shears'

export const isUrl = (url?: string) => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch (_e) {
    return false
  }
}

export const sanitizeHtml = (html?: string) => {
  if (!html) return undefined
  return sanitize(html, {
    allowedTags: [
      'div',
      'article',
      'aside',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'section',
      'blockquote',
      'hr',
      'li',
      'ol',
      'p',
      'pre',
      'ul',
      'a',
      'b',
      'em',
      'i',
      'span',
      'strong',
      'time',
    ],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
      a: ['href', 'name', 'target'],
      // We don't currently allow img itself by default, but
      // these attributes would make sense if we did.
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
    },
    selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'tel'],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
    allowProtocolRelative: true,
    enforceHtmlBoundary: false,
  })
}

export const sanitizeText = (html?: string) => {
  const sanitized = sanitizeHtml(html)
  if (!sanitized) return undefined
  return textContent(parseDocument(sanitized))
    .trim()
    .replace(/\n{1,}/gim, '\n')
}

export const formatDate = (dateString?: string) => (dateString ? parseDate(dateString)?.toISOString?.() : undefined)

export const parseStartEnd = (y: string) =>
  parse(y).reduce(
    (a, b) => ({
      ...a,
      time_start: b.start?.date().toISOString(),
      time_end: b.end?.date().toISOString(),
    }),
    {
      time_start: undefined as any as string,
      time_end: undefined as any as string | undefined,
    },
  )

export const driver: Exclude<Context<any>['driver'], undefined> = (url) =>
  fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      From: 'lectures.london',
      'X-Bot-Name': 'LecturesLondonScraperBot',
      'X-Bot-Version': '1.0',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    },
  })
    .then((x) => x.text())
    .then((data) => ({ data, origin: new URL(url).origin }))
