import * as t from 'zod'

// Lectures
export const Lecture = t.object({
  title: t.string(),
  link: t.string(),
  time_start: t.string(),
  free: t.boolean(),

  summary: t.string().optional(),
  time_end: t.string().optional(),
  link_booking: t.string().optional(),
  summary_html: t.string().optional(),
  location: t.string().optional(),
  image: t.object({ src: t.string() }).optional(),
  cost: t.number().optional(),
  speakers: t.array(t.object({ name: t.string(), bio: t.string().optional() })).optional(),
})

export type Lecture = t.TypeOf<typeof Lecture>

// Hosts
export const Host = t.object({
  name: t.string(),
  icon: t.string().optional(),
  website: t.string(),
  description: t.string().optional(),
  lectures: t.array(Lecture),
  twitter: t.string().optional(),
  threads: t.string().optional(),
  bluesky: t.string().optional(),
})

export type Host = t.TypeOf<typeof Host>
