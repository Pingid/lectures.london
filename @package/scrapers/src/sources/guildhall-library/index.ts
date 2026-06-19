import '@total-typescript/ts-reset'
import { request } from '@package/shears'

import { crawler } from '../../context.js'
import { sanitizeText } from '../../utility/index.js'

const info = {
  name: 'Guildhall Library',
  website: 'https://www.cityoflondon.gov.uk/things-to-do/guildhall-library/Pages/default.aspx',
  twitter: '@GuildhallLib',
}

const org = 'https://www.eventbrite.co.uk/o/guildhall-library-3623855655'

/** Unique event detail URLs from an Eventbrite organiser page. */
const eventUrls = (html: string) => [
  ...new Set(html.match(/https:\/\/www\.eventbrite\.[a-z.]+\/e\/[a-z0-9-]+tickets-\d+/g) || []),
]

/** First schema.org Event embedded as JSON-LD on an Eventbrite event page. */
const ldEvent = (html: string): any | undefined =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => {
      try {
        return JSON.parse(m[1])
      } catch {
        return undefined
      }
    })
    .find((j: any) => /Event/.test(j?.['@type'] || ''))

export const run = crawler(async () => {
  const html = await request(org).then((x) => x.text())

  const lectures = await Promise.all(
    eventUrls(html).map(async (link) => {
      const ev = ldEvent(await request(link).then((x) => x.text()))
      if (!ev?.startDate) return undefined

      const offer = Array.isArray(ev.offers) ? ev.offers[0] : ev.offers
      const price = Number(offer?.highPrice ?? offer?.lowPrice ?? offer?.price ?? NaN)
      const image = typeof ev.image === 'string' ? ev.image : ev.image?.[0]

      return {
        title: ev.name,
        link,
        time_start: ev.startDate,
        time_end: ev.endDate,
        location: typeof ev.location === 'string' ? ev.location : ev.location?.name,
        summary: sanitizeText(ev.description),
        image: image ? { src: image } : undefined,
        free: price === 0,
      }
    }),
  )

  return { ...info, lectures: lectures.filter(Boolean) }
})
