import * as s from '@package/shears'

import { parseStartEnd, sanitize, sanitizeText } from '../../utility'
import { crawler } from '../../context'
import { Lecture } from '../../entities'

const info = { name: 'School of Advanced Study', website: 'https://www.sas.ac.uk', twitter: '@SASNews' }

const lecture = s.query({
  link: s.map(s.query('a@href'), (x) => (x ? `https://www.sas.ac.uk${x}` : undefined)),
  merge: s.goto(
    'a@href',
    s.query({
      title: 'h1',
      time: s.map(s.query('dl'), (x) => (x ? parseStartEnd(x) : undefined)),
      booking_link: '.c-content-hero__cta-links a@href',
      summary: s.map(s.query('.c-text', s.html), sanitizeText),
      summary_html: s.map(s.query('.c-text', s.html), sanitize),
    }),
  ),
})

// School of Advanced Study

const getLectures = async (page: number = 1, max: number = 0): Promise<Partial<Lecture>[]> => {
  const all = await s
    .goto(`https://www.sas.ac.uk/search-events/event_type/7004?online=${page}`, s.query(['article'], lecture))()
    .then((x) => x.map((x) => ({ ...x, ...x?.merge, ...x?.merge?.time, free: true })))
  if (all.length > 0 && max > 0) return getLectures(page + 1, max - 1).then((y) => [...all, ...y])
  return all
}

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(() =>
  getLectures(1, 4)
    .then(async (lectures) => ({ ...(await getHost()), lectures }))
    .then((x) => {
      return x
    }),
)
run.debug = true
