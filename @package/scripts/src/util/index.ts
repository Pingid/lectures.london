import dayjs from 'dayjs'
import fs from 'fs'
import z from 'zod'

export const getTodaysLectures = async (file: string) => {
  return fs.promises
    .readFile(file, 'utf-8')
    .then((x) => JSON.parse(x))
    .then((x) => (x as unknown[]).filter((y): y is LectureSchema => LectureSchema.safeParse(y).success))
    .then((x) =>
      x.filter(
        (y) =>
          dayjs(y.time_start).isAfter(dayjs().startOf('day')) && dayjs(y.time_start).isBefore(dayjs().endOf('day')),
      ),
    )
}

export const LectureSchema = z.object({
  id: z.string(),
  link: z.string(),
  title: z.string(),
  time_start: z.string(),
  host: z.object({ name: z.string(), twitter: z.string(), bluesky: z.string().optional() }),
})
export type LectureSchema = z.infer<typeof LectureSchema>

export const siteLink = (talk: LectureSchema) =>
  `https://lectures.london/${slugit(talk.host.name)}/${slugit(talk.title)}`

const slugit = (str: string) =>
  str
    .replace(/[^\w\s]/gim, '')
    .replace(/\s{1,}/gim, '-')
    .toLowerCase()
