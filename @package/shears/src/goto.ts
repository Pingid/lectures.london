import { parseDocument } from 'htmlparser2'
import * as is from 'typeofit'

import { Parsed, Shear, Context } from './types'
import { Query, query } from './query'

declare module './types' {
  export interface Context<A> {
    origin?: string
    driver?: (
      url: string,
      ctx?: Context<any>,
    ) => Promise<Partial<Omit<Context<any>, 'data'>> & { data: string | Parsed }>
  }
}

export interface GoTo {
  <T>(
    source: string,
    query: Query<T>,
    config?: {
      paginate?: { selector: string | Shear<Parsed | undefined, string>; limit?: number; failOnMissing?: boolean }
      driver?: (
        url: string,
        ctx?: Context<any>,
      ) => Promise<Partial<Omit<Context<any>, 'data'>> & { data: string | Parsed }>
    },
  ): Shear<Parsed | undefined, T>
  use: (ctx: Partial<Context<any>>) => GoTo
}

export const goto: GoTo = (source, selector, options) => {
  const page = { acc: 0 }
  const execute =
    (_url: string): any =>
    async (ctx?: Context<Parsed>) => {
      const driver =
        ctx?.driver ||
        options?.driver ||
        ((url, ctx) =>
          fetch(url)
            .then((x) => x.text())
            .then((x) => ({ ...ctx, origin: new URL(url).origin, data: x })))

      let url = _url

      if (url.startsWith('/') && ctx?.origin) url = `${ctx.origin}${url}`

      if (!isUrl(url)) {
        if (!ctx?.data) throw new Error(`${url} is not a valid URL`)
        const result = await query(url)(ctx)
        if (!result && page.acc > 0 && !options?.paginate?.failOnMissing) return []
        if (!result) {
          const iteration = options?.paginate ? ` on paginate: ${page.acc}` : ''
          throw new Error(`Did find a result for ${url}${iteration}`)
        }
        if (isUrl(result)) url = result
        if (result.trim().startsWith('/') && ctx.origin) url = `${ctx.origin}${result.trim()}`
        if (!isUrl(url)) throw new Error(`Found invalid url ${result} for ${url}`)
      }

      return driver(url, ctx)
        .then((x) => ({ ...ctx, ...x, data: is.string(x.data) ? parseDocument(x.data) : x.data }))
        .then((x) => {
          return Promise.resolve(selector(x)).then(async (result: any) => {
            if (!options?.paginate?.selector) return result
            const limit = is.number(options?.paginate.limit) ? options?.paginate.limit : Infinity
            if (page.acc >= limit) return [result]
            page.acc += 1
            const selector = is.string(options.paginate.selector)
              ? options.paginate.selector
              : await options.paginate.selector(x)

            return execute(selector)(x).then((res: any[]) => [result, ...res])
          })
        })
    }

  return execute(source)
}

goto.use = (_ctx) => {
  const _goto: GoTo = (url, selector, options) => (ctx) => goto(url, selector, options)({ ...ctx, ..._ctx } as any)
  _goto.use = (ctx) => goto.use({ ..._ctx, ...ctx })
  return _goto
}

const isUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (_e) {
    return false
  }
}
