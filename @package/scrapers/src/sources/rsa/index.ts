import * as s from '@package/shears'

import { parseStartEnd } from '../../utility'
import { crawler } from '../../context'

export const run = crawler(async () => {
  const events_link = `https://www.thersa.org/events`

  const cards = await s.goto(
    events_link,
    s.query('.contentListingGrid', ['li'], {
      link: 'a@href',
      image: 'img@src',
    }),
  )()

  const collect = await Promise.all(
    cards.map((x) =>
      s.goto(
        `https://www.thersa.org${x.link}`,
        s.query({
          link: () => Promise.resolve(`https://www.thersa.org${x.link}`),
          image: () => Promise.resolve({ src: `https://www.thersa.org${x.image}` }),
          title: 'h1',
          time_start: '.articleHeaderTime > time',
          time_end: '.articleHeaderTime > time:nth-child(2)',
          summary: '.wysiwyg',
          location: '.articleHeaderLocation',
        }),
      )(),
    ),
  )

  const lectures = collect.map((x) => ({
    free: true,
    link: x.link,
    title: x.title?.trim(),
    summary: x.summary?.trim(),
    location: x.location?.trim(),
    image: x.image,
    ...parseStartEnd(`${x.time_start?.replace(' |', ',')} - ${x.time_end}`),
  }))

  return {
    name: 'RSA',
    website: 'https://www.thersa.org',
    twitter: '@thersaorg',
    lectures,
  }
})
