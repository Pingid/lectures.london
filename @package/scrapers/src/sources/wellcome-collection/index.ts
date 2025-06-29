import { fetchDom, sanitizeHtml, sanitizeText } from '../../utility'
import { Host, Lecture } from '../../entities'
import { crawler } from '../../context'

const info: Omit<Host, 'lectures'> = {
  name: 'Wellcome Collection',
  website: 'https://wellcomecollection.org',
}

export const run = crawler(async () => {
  try {
    const dom = await fetchDom(`${info.website}/events`)
    const scriptElement = dom.document.body.querySelector('#__NEXT_DATA__')

    if (!scriptElement?.textContent) {
      throw new Error('Could not find __NEXT_DATA__ script element')
    }

    const data: any = JSON.parse(scriptElement.textContent)

    if (!data?.props?.pageProps?.events?.results) {
      throw new Error('Invalid data structure in __NEXT_DATA__')
    }

    const eventResults = data.props.pageProps.events.results.filter((event: any) => {
      const isRelevantFormat = event.format?.label &&
        ['Discussion', 'Session', 'Performance'].includes(event.format.label)

      const hasEducationalSeries = event.series && event.series.length > 0

      return isRelevantFormat || hasEducationalSeries
    })

    const lectures = await Promise.all(
      eventResults.map(async (event: any): Promise<Lecture> => {
        try {
          const eventId = event.id || event.uid
          const link = `${info.website}/events/${eventId}`

          const firstTime = event.times?.[0]
          if (!firstTime) {
            throw new Error(`No time information for event ${eventId}`)
          }

          const time_start = firstTime.startDateTime
          const time_end = firstTime.endDateTime

          
          let image: { src: string } | undefined
          if (event.image?.url) {
            image = {
              src: event.image['16:9']?.url || event.image.url
            }
          }

          let location: string | undefined
          if (event.locations?.places?.[0]?.label) {
            location = event.locations.places[0].label
          }

          let summary: string | undefined
          let summary_html: string | undefined

          try {
            const eventDom = await fetchDom(link)
            const contentElement = eventDom.document.body.querySelector('#main article .body-text, #main .body-text, main .body-text')

            if (contentElement) {
              const rawHtml = contentElement.outerHTML
              summary_html = sanitizeHtml(rawHtml)
              summary = sanitizeText(summary_html)
            }
          } catch (error) {
            console.warn(`Could not fetch detailed content for event ${eventId}:`, error)
            summary = event.title
          }

          return {
            title: event.title,
            free: true,
            location,
            link,
            image,
            time_start,
            time_end,
            summary,
            summary_html,
          }
        } catch (error) {
          console.error(`Error processing event ${event.id || event.uid}:`, error)
          throw error
        }
      })
    )

    return { ...info, lectures }
  } catch (error) {
    console.error('Error in Wellcome Collection scraper:', error)
    throw error
  }
})
