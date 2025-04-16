#!/usr/bin/env node

import { command, run, string, positional } from 'cmd-ts'
import { AtpAgent } from '@atproto/api'
import dayjs from 'dayjs'

import { siteLink, getTodaysLectures } from './util'

process.env.TZ = 'Europe/London'

const app = command({
  name: 'bluesky',
  args: {
    lectures: positional({ type: string, displayName: 'Json file containing lectures' }),
  },
  handler: async ({ lectures }) => {
    const agent = new AtpAgent({ service: 'https://bsky.social' })

    await agent.login({ identifier: process.env.BLUESKY_USERNAME!, password: process.env.BLUESKY_PASSWORD! })

    const data = await getTodaysLectures(lectures)

    for (let talk of data.slice(0, 1)) {
      const link = siteLink(talk)
      let text = `
${talk.title}

${dayjs(talk.time_start).format('HH:mm')}: ${talk.host.name}

${link}
      `.trim()

      const linkStart = text.indexOf(link)
      const linkEnd = linkStart + link.length

      await agent.post({
        text: text,
        tags: ['lectureslondon', 'london', 'lectures', 'publiclectures'],
        facets: [
          {
            index: { byteStart: linkStart, byteEnd: linkEnd },
            features: [{ uri: link, $type: 'app.bsky.richtext.facet#link' }],
          },
        ],
      })
    }
  },
})

run(app, process.argv.slice(2))
