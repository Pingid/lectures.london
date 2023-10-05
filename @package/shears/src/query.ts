import { CountArrayDepth, Last, Parsed, Shear, Typeof } from './types'
import { selectOne, selectAll } from 'css-select'
import * as du from 'domutils'
import * as is from 'typeofit'

export interface Query<T> extends Shear<Parsed, T> {}

export const query: {
  <T extends ReadonlyArray<string | [string]>>(...args: T): Query<CountArrayDepth<T, string | undefined>>
  <T extends [...ReadonlyArray<string | [string]>, Shear<Parsed, any>]>(
    ...args: T
  ): Query<CountArrayDepth<T, Typeof<Last<T>> | undefined>>
  <
    T extends [
      ...ReadonlyArray<string | [string] | Shear<Parsed, Parsed>>,
      Record<string, string | [string] | Shear<Parsed, any>>,
    ],
  >(
    ...args: T
  ): Query<
    CountArrayDepth<
      T,
      {
        [K in keyof Last<T>]: Last<T>[K] extends [string]
          ? string[]
          : Last<T>[K] extends Shear<any, infer I>
          ? Awaited<I>
          : string | undefined
      }
    >
  >
} =
  (...args: any[]) =>
  async (ctx: any) => {
    const [selector, ...rest] = args

    const isLast = rest.length === 0

    if (is.string(selector)) {
      let [qry, attr] = selector.split('@')
      const data = qry ? selectOne(qry, ctx.data) : ctx.data
      if (!isLast) return query(...rest)({ ...ctx, data })
      if (attr) return data?.attribs?.[attr]
      if (!data) return undefined
      return du.textContent(data)
    }

    if (is.func(selector)) {
      return selector(ctx).then((result: any) => {
        if (!isLast) return query(...rest)(result)
        return result
      })
    }

    if (is.array()(selector)) {
      if (!ctx.data) return []
      let [qry, attr] = selector[0].split('@')
      const data = selectAll(qry, ctx.data)
      if (!isLast) return Promise.all(data.map((y) => query(...rest)({ ...ctx, data: y })))
      return data.map((x) => {
        if (attr) return x?.attribs?.[attr]
        return du.textContent(x)
      })
    }

    return Promise.all(
      Object.keys(selector).map((key) => query(selector[key])(ctx).then((value: any) => [key, value])),
    ).then((x) => Object.fromEntries(x))
  }
