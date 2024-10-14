#!/usr/bin/env node

import { command, run, string, positional } from 'cmd-ts'
import { TwitterApi } from 'twitter-api-v2'
import dayjs from 'dayjs'
import fs from 'fs'
import z from 'zod'

process.env.TZ = 'Europe/London'

const app = command({
  name: 'tweet',
  args: {
    lectures: positional({ type: string, displayName: 'Json file containing lectures' }),
  },
  handler: async ({ lectures }) => {
    const client = await TwitSchema.parseAsync({
      appKey: process.env.TWITTER_CONSUMER_KEY,
      appSecret: process.env.TWITTER_CONSUMER_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    })
      .then((x) => new TwitterApi(x))
      .catch((e: z.ZodError) => {
        console.error(e)
        return Promise.reject(new Error('Missing twitter client keys'))
      })

    const data = await fs.promises
      .readFile(lectures, 'utf-8')
      .then((x) => JSON.parse(x))
      .then((x) => (x as unknown[]).filter((y): y is LectureSchema => LectureSchema.safeParse(y).success))
      .then((x) =>
        x.filter(
          (y) =>
            dayjs(y.time_start).isAfter(dayjs().startOf('day')) && dayjs(y.time_start).isBefore(dayjs().endOf('day')),
        ),
      )

    for (let i in data) {
      const status = generateLectureTweet(data[i])
      await client.v2.tweet(status).catch((e) => {
        console.error(`Failed to post`, e)
        console.error(status)
      })
    }
  },
})
run(app, process.argv.slice(2))

const LectureSchema = z.object({
  id: z.string(),
  link: z.string(),
  title: z.string(),
  time_start: z.string(),
  host: z.object({ name: z.string(), twitter: z.string() }),
})
type LectureSchema = z.infer<typeof LectureSchema>

const TwitSchema = z.object({
  appKey: z.string(),
  appSecret: z.string(),
  accessToken: z.string(),
  accessSecret: z.string(),
})

const generateLectureTweet = (talk: z.TypeOf<typeof LectureSchema>) =>
  `${talk.title}
${dayjs(talk.time_start).format('HH:mm')}: ${talk.host.name}
https://lectures.london/${slugit(talk.host.name)}/${slugit(talk.title)}

${talk.link}

${talk.host.twitter} #london #lectures #publiclectures #lectureslondon 
`

const slugit = (str: string) =>
  str
    .replace(/[^\w\s]/gim, '')
    .replace(/\s{1,}/gim, '-')
    .toLowerCase()
