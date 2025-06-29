import * as s from '@package/shears'

import { parseStartEnd, sanitizeHtml, sanitizeText } from '../../utility'
import { crawler } from '../../context'
import { Lecture } from '../../entities'

const info = {
  name: 'Birkbeck, University of London',
  website: 'https://www.bbk.ac.uk',
  twitter: '@BirkbeckUoL',
}

// Helper function to extract location from venue text
const extractVenueLocation = (text?: string): string | undefined => {
  if (!text) return undefined

  const venueMatch = text.match(/Venue:\s*(.+?)(?:\n|$)/i)
  if (venueMatch && venueMatch[1]) {
    return venueMatch[1].trim()
  }

  return undefined
}

const extractBirkbeckSummary = (text?: string): string | undefined => {
  if (!text) return undefined

  const summaryMatch = text.match(/Book your place[\s\S]*?\n([\s\S]*?)(?=Tags:|$)/i)
  if (summaryMatch && summaryMatch[1]) {
    return summaryMatch[1]
      .replace(/Contact name:[\s\S]*$/i, '') // Remove contact info
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
  }

  return undefined
}

const getLectures = async (): Promise<Partial<Lecture>[]> => {
  try {
    const eventCards = await s
      .goto('https://www.bbk.ac.uk/events?tag=34', s.query(['a[href*="events/event"]'], {
        link: '@href',
        title: 'h3',
      }))();

    const events = await Promise.all(
      eventCards.map((card: any) =>
        s.goto(
          `https://www.bbk.ac.uk/${card.link}`,
          s.query({
            title: () => Promise.resolve(card.title),
            link: () => Promise.resolve(`https://www.bbk.ac.uk/${card.link}`),
            summary: s.map(s.query('div.row.column.max-medium', s.html), sanitizeText),
            summary_html: s.map(s.query('div.row.column.max-medium', s.html), sanitizeHtml),
            booking_link: s.map(s.query('a[href*="book"], a[href*="register"], a[href*="eventbrite"]@href'), (x) => x),
            time_detail: s.map(s.query('time, [class*="time"], [class*="date"], .event-date, .event-time'), (x) => x?.trim()),
            venue_text: s.map(s.query('div.row.column.max-medium', s.html), sanitizeText),
          }),
        )(),
      ),
    );

    const processedEvents = events
      .filter((event: any) => event.title && event.link)
      .map((event: any) => {
        let time_start: string | undefined;
        let time_end: string | undefined;

        const timeText = event.time_detail;
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
          location: extractVenueLocation(event.venue_text),
          summary: extractBirkbeckSummary(event.venue_text),
          summary_html: event.summary_html,
          link_booking: event.booking_link,
          free: true
        };
      });

    return processedEvents;
  } catch (error) {
    return [];
  }
};

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
