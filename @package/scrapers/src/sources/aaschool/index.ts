import * as s from '@package/shears'
import phin from 'phin'

import { formatDate } from '../../utility'
import { crawler } from '../../context'

const info = {
  name: 'Architectural Association School of Architecture',
  website: 'https://www.aaschool.ac.uk/',
  twitter: '@AASchool',
}
const getLectures = (result: any[]) =>
  result.map((x: any) => ({
    ...x,
    link: `https://www.aaschool.ac.uk/${x.slug}`,
    title: x.title,
    summary: x.summary,
    summary_html: x.description,
    speakers: x.speaker.split(', ').map((name: string) => ({ name })),
    booking_link: x.externalLink,
    image: { src: `https://www.aaschool.ac.uk${x.mediaFile}` },
    time_start: formatDate(`${x.eventDate}, ${x.eventStartTime}`),
    time_end: formatDate(`${x.eventDate}, ${x.eventEndTime}`),
    free: true,
  }))

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(async () => {
  const url =
    'https://www.aaschool.ac.uk/eventslistingfilter.json?typefilter=quicklinkupcoming&topicfilter=1&searchbox='
  const req = await phin<any>({ method: 'GET', url, parse: 'json' }).then((x) => x.body)
  const host = await getHost()
  return {
    ...host,
    lectures: getLectures(req),
  }
})
