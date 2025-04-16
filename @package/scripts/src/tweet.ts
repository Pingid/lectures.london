#!/usr/bin/env node

import { command, run, string, positional } from 'cmd-ts'
import { TwitterApi } from 'twitter-api-v2'
import dayjs from 'dayjs'
import z from 'zod'

import { getTodaysLectures, siteLink } from './util'

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

    const data = await getTodaysLectures(lectures)

    for (let talk of data) {
      const status = `
${talk.title}
${dayjs(talk.time_start).format('HH:mm')}: ${talk.host.name}
${siteLink(talk)}

${talk.link}

${talk.host.twitter} #london #lectures #publiclectures #lectureslondon 
      `.trim()

      await client.v2.tweet(status).catch((e) => {
        console.error(`Failed to post`, e)
        console.error(status)
      })
    }
  },
})
run(app, process.argv.slice(2))

const TwitSchema = z.object({
  appKey: z.string(),
  appSecret: z.string(),
  accessToken: z.string(),
  accessSecret: z.string(),
})
