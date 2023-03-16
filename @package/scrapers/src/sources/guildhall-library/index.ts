import '@total-typescript/ts-reset'
import * as s from '@package/shears'
import { crawler } from '../../context'
import { parseStartEnd } from '../../utility'

export const run = crawler(async () => {
  const all_links = await s.goto(
    'https://www.eventbrite.co.uk/o/guildhall-library-3623855655',
    s.query(['article a@href']),
  )()

  const lecture_links = all_links.filter(Boolean).reduce((a, b) => (a.includes(b) ? a : [...a, b]), [] as string[])

  const lectures = await Promise.all(
    lecture_links.map((link) =>
      s.goto(
        link,
        s.query({
          title: 'h1',
          link: () => Promise.resolve(link),
          free: s.map(s.query('[data-testid="ticket-card-compact-size-display-price"]'), (x) =>
            /Free/gim.test(x || ''),
          ),
          location: s.map(s.query('[aria-labelledby="location-heading"]'), (x) =>
            (x || '').trim().replace(/(Location)|(hide\smap)/gim, ''),
          ),
          time: s.map(s.query('.date-and-time'), (x) => parseStartEnd(x || '')),
          summary: '.has-user-generated-content',
        }),
      )(),
    ),
  )

  return {
    name: 'Guildhall Library',
    website: 'https://www.cityoflondon.gov.uk/things-to-do/guildhall-library/Pages/default.aspx',
    twitter: '@GuildhallLib',
    lectures: lectures.map((x) => ({ ...x, ...x.time })).filter((x) => !!x.time_start),
  }
})
