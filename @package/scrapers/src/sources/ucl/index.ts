import { crawler } from '../../context'
import { Lecture } from '../../entities'

const fetch_lectures = async (): Promise<Lecture[]> => {
  const pages = [0, 11, 21, 31, 41]
  const events = await Promise.all(
    pages.map((start_rank) =>
      fetch(
        `https://cms-feed.ucl.ac.uk/s/search.json?collection=drupal-meta-events&f.Event+types|UclEventType=Public+lecture&start_rank=${start_rank}`,
      )
        .then((x) => x.json())
        .then((x: any) => x.response.resultPacket.results),
    ),
  ).then((x) => x.flat() as any[])

  return events.map((x) => {
    const location = [
      x.listMetadata.UclEventLocationCity,
      x.listMetadata.UclEventLocationStreet,
      x.listMetadata.UclEventLocationRoom,
    ]
      .filter(Boolean)
      .join(', ')

    return {
      free: true,
      title: x.title,
      link: x.displayUrl,
      image: x.metaData.I,
      summary: x.summary,
      link_booking: x.listMetadata?.UclEventBookingLink?.[0],
      location,
      time_start: x.metaData.UCLEventStartDate,
      time_end: x.metaData.UCLEventEndDate,
    }
  })
}

export const run = crawler(async () => {
  const lectures = await fetch_lectures()
  return {
    name: 'University College London',
    website: 'https://www.ucl.ac.uk/',
    twitter: '@ucl',
    threads: '@ucl',
    description: '',
    lectures,
  }
})
