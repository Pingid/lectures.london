import * as s from '@package/shears'

import { parseStartEnd } from '../../utility'
import { crawler } from '../../context'

export const run = crawler(async () => {
  const events_link = `https://www.imperial.ac.uk/whats-on/?audience=&type=lecture&quantity=200`

  const description = await s.goto('https://www.imperial.ac.uk', s.query('meta[name="description"]@content'))()
  const links = await s.goto(
    events_link,
    s.query(['.search-results > div'], { link: 'a@href', title: '.title', tags: '.tags' }),
  )()

  const lecture_links = links.filter((x) => /lecture/gim.test(x.tags || ''))

  const collect = await Promise.all(
    lecture_links.map((x) =>
      s.goto(
        `https://www.imperial.ac.uk${x.link}`,
        s.query({
          title: () => Promise.resolve(x.title),
          link: () => Promise.resolve(`https://www.imperial.ac.uk${x.link}`),
          date: '.event-details__date',
          time: '.event-details__time',
          summary: `[itemprop="description"]`,
          details: ['.event-details__block'],
        }),
      )(),
    ),
  )

  const lectures = collect
    .map((x) => {
      const details = Object.fromEntries(
        (x.details || [])
          .map((x) => x.split('\n'))
          .flat()
          .map((x) => x.trim())
          .filter(Boolean)
          .map((x) => {
            const [name, ...value] = x.trim().split(/:|\s/)
            if (!name) return null
            return [name, value.join(' ').trim() || '_']
          })
          .filter(Boolean),
      )

      return {
        title: x.title,
        link: x.link,
        summary: x.summary?.trim(),
        free: details.Free && details.Audience === 'Open to all',
        location: details.Location,
        ...parseStartEnd(`${details.Date.split('-')[0]} ${details.Time}`),
      }
    })
    .filter((x) => x.time_start)

  return {
    name: 'Imperial College',
    website: 'https://www.imperial.ac.uk',
    twitter: '@imperialcollege',
    description,
    lectures,
  }
})
