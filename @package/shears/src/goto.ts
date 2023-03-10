import { parseDocument } from 'htmlparser2'
import phin from 'phin'

import { Parsed, Shear, Context } from './types'
import { Query, query } from './query'

export interface GoTo<T> extends Shear<Parsed | undefined, T> {
  paginate: (selector: string, limit?: number) => GoTo<T[]>
}

export const goto: {
  <T>(source: string, query: Query<T>): GoTo<T>
} = (urlOrSelector: string, selector: (ctx: Context<Parsed>) => any) => {
  const page = { selector: null as string | null, limit: 100, acc: 0 }

  const execute =
    (_url: string): any =>
    async (ctx?: Context<Parsed>) => {
      let url = _url
      if (/^\//.test(url) && ctx?.origin) url = `${ctx.origin}${url}`
      if (!isUrl(url)) {
        if (!ctx?.data) throw new Error(`${urlOrSelector} is not a valid URL`)
        const result = await query(url)(ctx)
        if (!result) throw new Error(`Did find a result for ${urlOrSelector}`)
        if (isUrl(result)) url = result
        if (/^\//.test(result.trim()) && ctx.origin) url = `${ctx.origin}${result.trim()}`
        if (!isUrl(url)) throw new Error(`Found invalid url ${result} for ${_url}`)
      }

      return phin({ url, followRedirects: true }).then((x) => {
        const data = parseDocument(x.body.toString())
        const _ctx = { ...ctx, data, origin: new URL(url).origin }
        return Promise.resolve(selector(_ctx)).then((result: any) => {
          if (!page.selector) return result
          if (page.acc >= page.limit) return [result]
          page.acc += 1
          return execute(page.selector)(_ctx).then((res: any[]) => [result, ...res])
        })
      })
    }

  const run = execute(urlOrSelector)

  run.paginate = (selector: string, limit?: number) => {
    page.selector = selector
    page.limit = limit || Infinity
    return run
  }
  return run
}

const isUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (_e) {
    return false
  }
}
