import * as s from '@package/shears'
import xml from 'xml-js'
import phin from 'phin'

import { formatDate } from '../../utility'
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
  const rss_url = 'http://webservices.admin.cam.ac.uk/events/api/programmes/11/calendar/categories/12/events.rss'
  const body = await phin({ method: 'GET', url: rss_url }).then((x) => x.body.toString())
  const parsed = xml.xml2js(body, { compact: true }) as xml.ElementCompact

  const host = await getHost()
  const lectures = parsed.rss.channel.item.map((x: any) => ({
    free: true,
    link: x.link._text,
    title: x.title._text.split(' - ')[1],
    summary: x.description._text,
    location: x['ev:location']._text,
    time_start: formatDate(x['ev:startdate']._text),
  })) as any[]

  return { ...host, lectures }
})
