import { fetchDom, sanitizeHtml, sanitizeText } from '../../utility'
import { Host, Lecture } from '../../entities'
import { crawler } from '../../context'

const info: Omit<Host, 'lectures'> = {
  name: 'Welcome Collection',
  website: 'https://wellcomecollection.org',
}

export const run = crawler(async () => {
  const dom = await fetchDom(`${info.website}/events`)
  const data: any = JSON.parse(dom.document.body.querySelector('#__NEXT_DATA__')?.textContent!)
  const lectures = data.props.pageProps.events.results
    .filter((x: any) => x.labels.some((y: any) => y.text === 'Discussion'))
    .map(async (x: any): Promise<Lecture> => {
      const time_start = x.times[0].range.startDateTime.value
      const time_end = x.times[0].range.endDateTime.value
      const link = `${info.website}/events/${x.id}`
      const dom = await fetchDom(link)
      const image = { src: x.image.contentUrl }
      const text = dom.document.body.querySelector('#main article .grid .body-text')?.outerHTML
      const summary_html = sanitizeHtml(text)
      const summary = sanitizeText(summary_html)
      return {
        title: x.title,
        free: true,
        location: x.locations[0].title,
        link,
        image,
        time_start,
        time_end,
        summary,
        summary_html,
      }
    })

  return { ...info, lectures: await Promise.all(lectures) }
})
