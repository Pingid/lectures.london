#!/usr/bin/env node

import { command, run, string, option } from 'cmd-ts'
import { promises as fs } from 'fs'
import { createHash } from 'crypto'
import { Listr } from 'listr2'
import dayjs from 'dayjs'

import { sources, Sources, Entity } from '@package/scrapers'

const app = command({
  name: 'collect',
  args: {
    lectures: option({
      long: 'lectures',
      short: 'l',
      type: string,
      description: 'Json file to output lectures',
    }),
    hosts: option({
      long: 'hosts',
      short: 'h',
      type: string,
      description: 'Json file to output hosts',
    }),
  },
  handler: async (args) => {
    const results: Awaited<ReturnType<Sources[keyof Sources]['run']>>[] = []
    await new Listr(
      Object.entries(sources).map(([title, task]) => ({
        title,
        retry: 3,
        exitOnError: false,
        task: () => task.run({}).then((x) => results.push(x)),
        options: { showTimer: true },
      })),
      { concurrent: true, rendererOptions: { collapse: false, showTimer: true, suffixRetries: true } },
    ).run()

    const lectures = results
      .map((y) => y.lectures.map((z) => ({ ...z, host: { id: hash(y.website), name: y.name } })))
      .flat()
      .reduce(
        (a, b) => (a.some((y) => y.link === b.link) ? a : [...a, b]),
        [] as (Entity.Lecture & { host: { id: string; name: string } })[],
      )
      .filter((x) => x.free)
      .filter((x) => dayjs(x.time_start).isAfter(dayjs()))
      .sort((a, b) => new Date(a.time_start).valueOf() - new Date(b.time_start).valueOf())
      .map((x) => ({
        id: hash(x.link),
        link: x.link,
        title: x.title,
        summary: x.summary,
        location: x.location,
        host: x.host,
        time_start: x.time_start,
        time_end: x.time_end,
        image: x.image,
      }))

    const hosts = results.map((y) => ({ id: hash(y.website), website: y.website, name: y.name, twitter: y.twitter }))

    await fs.writeFile(args.lectures, JSON.stringify(lectures, null, 2))
    await fs.writeFile(args.hosts, JSON.stringify(hosts, null, 2))
  },
})
run(app, process.argv.slice(2))

export const hash = (value: string) => createHash('md5').update(value).digest('hex')
