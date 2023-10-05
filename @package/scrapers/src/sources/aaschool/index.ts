import phin from 'phin'

import { sanitizeText } from '../../utility'
import { crawler } from '../../context'

const info = {
  name: 'Architectural Association School of Architecture',
  website: 'https://www.aaschool.ac.uk/',
  twitter: '@AASchool',
}

export const run = crawler(async () => {
  const result = await phin<any[]>({
    url: 'https://www.aaschool.ac.uk/eventslisting.json?gettypefilter=quicklinkupcoming&gettopicfilter=1&getsearchfilter=&urlseries=0',
    parse: 'json',
  })

  return {
    ...info,
    lectures: result.body.map((x) => ({
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
