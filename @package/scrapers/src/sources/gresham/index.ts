import * as s from '@package/shears'
import phin from 'phin'

import { formatDate, sanitize, sanitizeText } from '../../utility'
import { crawler } from '../../context'

const info = {
  name: 'Gresham College',
  website: 'https://www.gresham.ac.uk/',
  twitter: '@GreshamCollege',
}

const whatsOnUrl = `https://www.gresham.ac.uk/sites/default/files/attachments/whatson.json`

const lecture = s.query({
  image: s.map(s.query({ src: 'article img@src' }), (x) => {
    if (x.src) return x as { src: string }
    return undefined
  }),
  summary: s.map(s.query('.m-entity__body', s.html), sanitizeText),
  summary_html: s.map(s.query('.m-entity__body', s.html), sanitize),
  booking_link: s.map(s.query('.sidebar__register a@href'), (x) => `https://www.gresham.ac.uk${x}`),
})

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(async () => {
  const events = await phin<any>({ url: whatsOnUrl, parse: 'json' }).then(
    (x) =>
      x.body.events.map((y: any) => ({
        title: y.title,
        link: `https://www.gresham.ac.uk${y.link}`,
        time_start: formatDate(y.calculated_start_date),
        time_end: formatDate(y.calculated_end_date),
      })) as { title: string; link: string; time_start: string; time_end: string }[],
  )

  const lectures = await Promise.all(
    events.map((x) =>
      s
        .goto(x.link, lecture)()
        .then((y) => ({ ...x, ...y, free: true })),
    ),
  )
  const host = await getHost()

  return { ...host, lectures }
})
