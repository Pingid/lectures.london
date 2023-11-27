import * as s from '@package/shears'
// @ts-ignore
import ICAL from 'ical.js'

import { crawler } from '../../context'

const info = {
  name: 'Cambridge University',
  website: 'https://www.cam.ac.uk/',
  twitter: '@Cambridge_Uni',
}

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(async () => {
  const webcalender = await fetch(
    `https://webservices.admin.cam.ac.uk/events/api/programmes/11/calendar/categories/12/events.ics?resultSetSize=20000`,
  ).then((x) => x.text())

  const lectures = ICAL.parse(webcalender)[2]
    .map((y: any) => Object.fromEntries(y[1].map((z: any) => [z[0], z[3]])))
    .map((y: any) => {
      return {
        title: y.summary,
        summary: y.description,
        location: y.location,
        time_start: y.dtstart || y.dtstamp,
        time_end: y.dtend,
        link: y.url,
        free: true,
      }
    })
  const host = await getHost()

  return { ...host, lectures }
})
