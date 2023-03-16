import * as s from '@package/shears'
import phin from 'phin'

import { parseStartEnd, sanitizeHtml, sanitizeText } from '../../utility'
import { crawler } from '../../context'

const info = {
  name: 'SOAS',
  website: 'https://www.soas.ac.uk',
  twitter: '@SOAS',
}

// const fields =
//   'path,title,field_teaser_summary,field_image,field_start_date,field_end_date,field_start_time,field_end_time'
const url = `https://www.soas.ac.uk/jsonapi/index/site?page[limit]=1000&filter[prefilter_type-filter][condition][path]=prefilter_type&filter[prefilter_type-filter][condition][operator]=IN&filter[prefilter_type-filter][condition][value][]=event&filter[prefilter_start_date-filter][condition][path]=prefilter_start_date&filter[prefilter_start_date-filter][condition][operator]=>=&filter[prefilter_start_date-filter][condition][value][]=2023-1-25&filter[event_type-filter][condition][path]=event_type&filter[event_type-filter][condition][operator]=IN&filter[event_type-filter][condition][value][]=329&sort[prefilter_start_date][path]=prefilter_start_date&sort[prefilter_start_date][direction]=asc&include=field_image,field_image.field_image`

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))

export const run = crawler(async () => {
  const events = await phin({ url, parse: 'json' }).then((x) => (x.body as any).data)
  const host = await getHost()

  const lectures = events.map((y: any) => {
    return {
      link: `https://www.soas.ac.uk${y.attributes.path.alias}`,
      title: y.attributes.title,
      summary: ((y.attributes?.field_teaser_summary?.value || '') + `\n${sanitizeText(y.attributes.body.value) || ''}`)
        .trim()
        .replace(/\n{1,}/gim, '\n'),
      summary_html:
        (y.attributes?.field_teaser_summary?.processed || '') + `${sanitizeHtml(y.attributes.body.value) || ''}`,
      location: y?.attributes?.field_venue,
      ...parseStartEnd(
        `${y.attributes.field_start_date}, ${y.attributes.field_start_time} ${
          y.attributes.field_end_time !== '0' ? ` to ${y.attributes.field_end_time}` : ''
        }`,
      ),
      free: true,
    }
  })

  return { ...host, lectures }
})
