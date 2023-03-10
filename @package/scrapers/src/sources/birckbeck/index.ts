import * as s from '@package/shears'
import unfluff from 'unfluffjs'

import { crawler } from '../../context'
import { Lecture } from '../../entities'

const info = {
  name: 'Birkbeck',
  website: 'http://www.bbk.ac.uk',
  twitter: '@BirkbeckUoL',
}

const lecture = s.query(['[data-equalizer-watch]'], {
  link: 'a@href',
  title: 'h3',
  time_start: 'p > time@datetime',
  time_end: 'p > time:nth-child(3)@datetime',
  location: s.map(s.query('p:nth-child(2)'), (x) => x?.trim()?.split('\n')?.[0]),
  merge: s.goto(
    'a@href',
    s.query({
      booking_link: '#remote-event a@href',
      summary: s.map(s.query(s.html), (x) => (x ? unfluff(x).text : undefined)),
    }),
  ),
})

const getLectures = (from: number = 0, max: number = 0): Promise<Partial<Lecture>[]> =>
  s
    .goto(`https://www.bbk.ac.uk/events/?tag=34${from ? `&b_start:int=${from}` : ''}`, lecture)()
    .then((x) => x.map((y) => ({ ...y, ...y.merge, free: true })))
    .then((x) => {
      if (x.length > 0 && max > 0) return getLectures(from + x.length, max - 1).then((y) => [...x, ...y])
      return x
    })

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(() =>
  getLectures(0, 10).then(async (lectures) => {
    return { ...(await getHost()), lectures }
  }),
)

// run.debug = true
