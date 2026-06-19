import { request } from '@package/shears'

import { sanitizeText } from '../../utility/index.js'
import { crawler } from '../../context.js'

const info = {
  name: 'Architectural Association School of Architecture',
  website: 'https://www.aaschool.ac.uk/',
  twitter: '@AASchool',
}

export const run = crawler(async () => {
  const result = await request(
    'https://www.aaschool.ac.uk/eventslisting.json?gettypefilter=quicklinkupcoming&gettopicfilter=1&getsearchfilter=&urlseries=0',
  )

  // The site sits behind anti-bot protection that frequently answers with an
  // HTML error/challenge page (HTTP 429). Degrade to no lectures instead of
  // throwing a JSON parse error that would spam the collector logs.
  const json = (await result.json().catch(() => null)) as { data?: any[] } | null

  if (!json?.data) {
    console.warn(`aaschool: unexpected response (status ${result.status}); skipping`)
    return { ...info, lectures: [] }
  }

  return {
    ...info,
    lectures: json.data.map((x) => ({
      link: `https://www.aaschool.ac.uk/publicprogramme/${x.slug}`,
      title: x.title,
      summary: sanitizeText(x.description),
      summary_html: x.description,
      speakers: x.speaker ? [{ name: x.speaker }] : [],
      image: { src: `https://www.aaschool.ac.uk${x.mediaFile}` },
      time_start: new Date(`${x.eventDate} ${x.eventStartTime}`).toISOString(),
      time_end: new Date(`${x.eventDate} ${x.eventEndTime}`).toISOString(),
      location: x.eventVenue,
      free: true,
    })),
  }
})
