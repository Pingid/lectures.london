import * as s from '@package/shears'

import { parseStartEnd, sanitizeHtml, sanitizeText } from '../../utility'
import { crawler } from '../../context'

const info = {
  name: 'Oxford University',
  website: 'https://www.ox.ac.uk',
  twitter: '@UniofOxford',
}

const getLectures = () =>
  s
    .goto(
      'https://www.ox.ac.uk/events-list?type=200',
      s.query(['.view-content .node-event'], {
        title: 'a',
        link: s.map(s.query('a@href'), (x) => `https://www.ox.ac.uk${x}`),
        merge: s.goto(
          'a@href',
          s.query({
            free: s.map(s.query('.field-name-field-event-cost > span'), (x) => /Free/gim.test(x || '')),
            date: '.field-name-field-event-date time',
            time: '.field-name-field-event-time > span',
            booking_link: '.field-name-field-event-booking-url a@href',
            summary: s.map(s.query('.field-type-text-with-summary', s.html), sanitizeText),
            summary_html: s.map(s.query(['.field-type-text-with-summary > * > *'], s.html), (x) =>
              x.map(sanitizeHtml).join(''),
            ),
          }),
        ),
      }),
      { paginate: { selector: 'li.next a@href', limit: 10 } },
    )()
    .then((x) => {
      return x.flat().map(
        (r) =>
          ({
            link: r.link,
            title: r.title,
            ...r.merge,
            ...parseStartEnd(`${r.merge.date}, ${r.merge.time}`),
          }) as any,
      )
    })
    .then((c) => {
      return c
    })

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(() =>
  getLectures()
    .then(async (lectures) => ({ ...(await getHost()), lectures }))
    .then((x) => {
      return x
    }),
)
