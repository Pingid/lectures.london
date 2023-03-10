import type { APIRoute } from 'astro'
import ical from 'ical-generator'
import dayjs from 'dayjs'
import lectures from '../../lectures.json'
import { config } from '../config'

export const get: APIRoute = async (props) => {
  return new Response(createCallender(`${props.url.href}`, lectures), {
    status: 200,
    headers: {
      'Content-disposition': 'attachment; filename=events.ics',
      'Access-Control-Allow-Headers': 'origin, x-requested-with, content-type',
      'Content-Type': 'text/calendar;charset=UTF-8',
    },
  })
}

const createCallender = (url: string, lectures: Lecture[]) => {
  const cal = ical({
    url,
    name: 'Lectures London',
    timezone: 'Europe/London',
    ttl: 12 * 60 * 60,
    source: url,
    description: config.description,
    events: lectures.map((lecture) => ({
      summary: lecture.title,
      start: dayjs(lecture.time_start).toISOString(),
      end: lecture.time_end
        ? dayjs(lecture.time_end).toISOString()
        : dayjs(lecture.time_start).add(1, 'hour').toISOString(),
      created: dayjs().toISOString(),
      description: lecture.summary,
      location: `${lecture.host.name}: ${lecture.location}`,
      url: lecture.link,
    })),
  })

  return cal.toString()
}
