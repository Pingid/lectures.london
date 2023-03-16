#!/usr/bin/env node

import { command, run, string, positional } from 'cmd-ts'
import dayjs from 'dayjs'
import Twit from 'twit'
import fs from 'fs'
import z from 'zod'

const app = command({
  name: 'tweet',
  args: {
    lectures: positional({ type: string, displayName: 'Json file containing lectures' }),
  },
  handler: async ({ lectures }) => {
    const client = await TwitSchema.parseAsync({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token: process.env.TWITTER_ACCESS_TOKEN,
      access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    })
      .then((x) => new Twit(x))
      .catch((e: z.ZodError) => {
        console.error(e)
        return Promise.reject(new Error('Missing twitter client keys'))
      })

    const data = await fs.promises
      .readFile(lectures, 'utf-8')
      .then((x) => JSON.parse(x))
      .then((x) => z.array(LectureSchema).parseAsync(x))
      .then((x) =>
        x.filter(
          (y) =>
            dayjs(y.time_start).isAfter(dayjs().startOf('day')) && dayjs(y.time_start).isBefore(dayjs().endOf('day')),
        ),
      )

    for (let i in data) {
      const status = generateLectureTweet(data[i])
      await client.post('statuses/update', { status })
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

const TwitSchema = z.object({
  consumer_key: z.string(),
  consumer_secret: z.string(),
  access_token: z.string(),
  access_token_secret: z.string(),
})

const generateLectureTweet = (talk: z.TypeOf<typeof LectureSchema>) =>
  `${talk.title}
${dayjs(talk.time_start).format('HH:mm')}: ${talk.host.name}
https://lectures.london/${talk.host.name
    .replace(/[^\w\s]/gi, '')
    .replace(/\s{1,}/gim, '-')
    .toLowerCase()}/${talk.id}

${talk.link}

${talk.host.twitter} #london #lectures #publiclectures #lectureslondon 
`
