import * as s from '@package/shears'

import { isUrl, parseStartEnd, sanitizeHtml, sanitizeText } from '../../utility'
import { crawler } from '../../context'
import { Lecture } from '../../entities'

const info = {
  name: 'King\'s College London',
  website: 'https://www.kcl.ac.uk',
  twitter: '@KingsCollegeLon',
}

const url = 'https://www.kcl.ac.uk/events/events-calendar?type=cb7cba1a-7738-43c6-a9f0-5856b5c0f03d'

// Helper function to extract location from div.block--location__details
const extractLocation = (locationText?: string): string | undefined => {
  if (!locationText) return undefined
  let cleaned = locationText
    .replace(/\s+/g, ' ')
    .trim()

  cleaned = cleaned
    .replace(/Room:/g, '\nRoom:')
    .replace(/\(\s*IoPPN\)/g, '(IoPPN)')
    .replace(/(Room:\s*[^,\n]+),?\s*IoPPN/g, '$1\nIoPPN')
    .replace(/(Theatre|Hall|Centre)IoPPN/g, '$1\nIoPPN')
    .replace(/(Room:\s*[A-Z0-9.()]+)([A-Z][a-z]+\s+[A-Z])/g, '$1\n$2')
    .replace(/(Room:\s*[^,\n]+),?\s*([A-Z][a-z]+\s+[Cc]ampus)/g, '$1\n$2')
    .replace(/(House|Museum|Building|Theatre|Hall|Centre)\s*([A-Z][a-z]+\s+[Cc]ampus)/g, '$1\n$2')
    .replace(/([A-Z0-9)]+)\s*([A-Z][a-z]+\s+[Cc]ampus)/g, '$1\n$2')

  return cleaned
    .replace(/\n\s+/g, '\n')
    .trim()
}



const lecture = s.query({
  link: s.map(s.query('@href'), (x) => (x ? `https://www.kcl.ac.uk${x}` : undefined)),
  title: s.query(''),
  page: s.goto(
    '@href',
    s.query({
      image: s.map(s.query('img[src*="/newimages/"]@src'), (y) => {
        if (!y) return undefined
        if (typeof y === 'string' && y.startsWith('http')) return { src: y }
        return { src: `https://www.kcl.ac.uk${y}` }
      }),
      summary: s.map(s.query('div.composer-container', s.html), sanitizeText),
      summary_html: s.map(s.query('div.composer-container', s.html), sanitizeHtml),
      booking_link: s.map(s.query('a[href*="eventbrite"]@href, a[href*="register"]@href, a[href*="booking"]@href'), (x) => (isUrl(x) ? x : undefined)),
      location_text: s.map(s.query('div.block--location__details', s.html), sanitizeText),
      time_detail: s.map(s.query('time, [class*="time"], [class*="date"], .event-date, .event-time'), (x) => x?.trim()),
    }),
  ),
})

const getLectures = (): Promise<Partial<Lecture>[]> =>
  s
    .goto(url, s.query(['h3 a'], lecture))()
    .then((events: any[]) => {
      const processedEvents = events
        .filter((event: any) => event.title && event.link)
        .map((event: any) => {
          let time_start: string | undefined;
          let time_end: string | undefined;

          const timeText = event.page?.time_detail;
          if (timeText) {
            try {
              const parsed = parseStartEnd(timeText);
              time_start = parsed.time_start;
              time_end = parsed.time_end;
            } catch (error) {
              console.warn(`Could not parse time for event: ${event.title}`, error);
            }
          }

          return {
            title: event.title,
            link: event.link,
            time_start,
            time_end,
            location: extractLocation(event.page?.location_text),
            image: event.page?.image,
            summary: event.page?.summary,
            summary_html: event.page?.summary_html,
            link_booking: event.page?.booking_link,
            free: true
          };
        });

      return processedEvents;
    })
    .catch(() => {
      return [];
    });

const getHost = () =>
  s
    .goto(info.website, s.query({ description: 'meta[name="description"]@content' }))()
    .then((x) => ({ ...info, description: x.description || '' }))
    .catch(() => ({ ...info, description: '' }));

export const run = crawler(async () => {
  try {
    const lectures = await getLectures();
    const host = await getHost();
    return { ...host, lectures };
  } catch (error) {
    throw error;
  }
});
