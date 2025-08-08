import querystring from 'querystring'
import * as s from '@package/shears'
import dayjs from 'dayjs'

import { parseStartEnd } from '../../utility'
import { crawler } from '../../context'

export const run = crawler(async () => {
  const query = querystring.encode({
    entryRequirements: 'false',
    timePeriod: `${dayjs().toISOString()}--${dayjs().add(1, 'year').toISOString()}`,
    typeOfEvent: '0/1/277/281/282',
    type: '9f357d51-c842-5eb3-8c2a-12d17fe42c07',
  })
  const events_link = `https://www.lse.ac.uk/events/search-events?${query}`

  const cards = await s.goto(
    events_link,
    s.query(['.listing__results div'], {
      link: 'a@href',
      title: '.card__title',
      time: '.card__description',
      location: '.card__location',
      image: 'img@src',
    }),
  )()

  const collect = await Promise.all(
    cards
      .filter((x) => x.link)
      .map((x) =>
        s.goto(
          `https://www.lse.ac.uk${x.link || ''}`,
          s.query({
            link: () => Promise.resolve(`https://www.lse.ac.uk${x.link || ''}`),
            image: () => Promise.resolve({ src: `https://www.lse.ac.uk${x.image}` }),
            title: 'h1',
            time: () => Promise.resolve(x.time),
            summary: '.page__content',
            summary_html: s.query('.page__content', s.html),
            location: () => Promise.resolve(x.location),
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
    ...parseStartEnd(x.time?.trim() || ''),
  }))

  return {
    name: 'London School of Economics',
    website: 'http://www.lse.ac.uk/',
    twitter: '@LSEnews',
    lectures,
  }
})
