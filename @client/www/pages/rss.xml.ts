import rss, { RSSFeedItem } from '@astrojs/rss'
import { config } from '../config'
import dayjs from 'dayjs'

export const GET = async () => {
  const lectures = await import('../../lectures.json').then((x) => x.default)

  const image = (src: string, title: string) => [
    `<image:image xmlns:image="${src}">`,
    `<media:content url="${src}" type="image/jpeg"><media:title type="html">${title}</media:title></media:content>`,
    `<enclosure url="${src}" type="image/jpeg" />`,
  ]

  return rss({
    title: config.title,
    description: config.description,
    site: config.url,
    items: lectures.map(
      (x): RSSFeedItem => ({
        title: x.title,
        description: `time: ${dayjs(x.time_start).format('DD MMM YY')}\nlocation:${x.host.name}`,
        content: x?.summary,
        pubDate: new Date(),
        link: x.link,
        source: { title: '', url: x.link },
        customData: [x.image?.src ? image(x.image?.src, x.title) : ''].join(''),
      }),
    ),
    customData: [
      `<lastBuildDate>${new Date().toDateString()}</lastBuildDate>`,
      `<generator>Lectures Londond</generator>`,
      `<language>en</language>`,
      `<image><title>${config.title}</title><url>${config.url}/icon.png</url><link>${config.url}</link></image><copyright>All rights reserved 2023, ${config.title}</copyright>`,
    ].join(''),
  })
}
