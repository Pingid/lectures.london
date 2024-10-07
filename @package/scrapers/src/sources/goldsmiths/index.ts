import * as s from '@package/shears'
import unfluff from 'unfluffjs'

import { parseStartEnd } from '../../utility'
import { crawler } from '../../context'

const info = {
  name: 'Goldsmiths',
  website: 'https://www.gold.ac.uk/',
  twitter: '@GoldsmithsUoL',
}

const url = () =>
  `https://www.gold.ac.uk/events/?collection=goldsmiths-events&query=&f.Category|FUN2xbsph7ywx3p53hdwfamupkqt=Lecture&datepicker=`

const image = s.map(
  s.query({
    src: s.query('.hero__image@style'),
  }),
  (x) => {
    if (!x.src) return undefined
    const [_, r] = /\'(.*?)\'/gim.exec(x.src) || []
    if (!r) return undefined
    return { src: `https://www.gold.ac.uk${r}` }
  },
)

const lecture = s.query({
  link: '@href',
  title: 'h3',
  merge: s.goto(
    '@href',
    s.query({
      image,
      summary: s.map(s.query(s.html), (x) => (x ? unfluff(x).text : undefined)),
      location: `meta[name="location"]@content`,
      times: s.map(s.query('meta[name="dates"]@content'), (x) => {
        if (!x) return []
        return x
          .split(',')
          .filter((x) => !!x.trim())
          .map(parseStartEnd)
      }),
    }),
  ),
})

const getLectures = () => s.goto(url(), s.query(['article > a'], lecture))()

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(async () => {
  const result = await getLectures()
  const host = await getHost()
  return {
    ...host,
    lectures: result.map((x) => (x?.merge.times || []).map((y) => ({ ...x, ...x?.merge, free: true, ...y }))).flat(),
  }
})

run.debug = true
