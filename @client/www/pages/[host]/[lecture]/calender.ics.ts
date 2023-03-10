import type { APIRoute } from 'astro'
import ical from 'ical-generator'
import dayjs from 'dayjs'
import { slugit } from '../../../../src/util'

export const getStaticPaths = async () => {
  const lectures = await import('../../../../lectures.json').then((x) => x.default)
  return lectures.map((x) => ({
    params: { lecture: x.id, host: slugit(x.host.name) },
    props: x,
  }))
}

export const get: APIRoute = async (props) => {
  const lecture = await import('../../../../lectures.json').then((x) =>
    x.default.find((y) => y.id === props.params.lecture),
  )
  if (!lecture) return new Response('Missing lecture', { status: 400 })
  return new Response(createCallender(`${props.url.href}`, [lecture]), {
    status: 200,
    headers: {
      'Content-disposition': 'attachment; filename=events.ics',
      'Access-Control-Allow-Headers': 'origin, x-requested-with, content-type',
      'Content-Type': 'text/calendar;charset=UTF-8',
    },
  })
}

const createCallender = (url: string, lectures: Lecture[]) => {
  const cal = ical({ url, name: 'Lectures London', timezone: 'Europe/London' })

  lectures.forEach((lecture) => {
    cal.createEvent({
      summary: lecture.title,
      start: dayjs(lecture.time_start).toISOString(),
      end: lecture.time_end
        ? dayjs(lecture.time_end).toISOString()
        : dayjs(lecture.time_start).add(1, 'hour').toISOString(),
      description: lecture.summary,
      location: `${lecture.host.name}: ${lecture.location}`,
      url: lecture.link,
    })
  })

  return cal.toString()
}
