import * as Entity from './entities'

export interface CrawlerContext {}

type DeepPartial<T> = T extends Record<any, any>
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T extends []
  ? DeepPartial<T[number]>[]
  : T

export const crawler: {
  (fn: (ctx: CrawlerContext) => Promise<DeepPartial<Entity.Host>>): {
    debug?: boolean
    (ctx: CrawlerContext): Promise<Entity.Host>
  }
} = (fn) => {
  const caller = (ctx: CrawlerContext) => fn(ctx).then((x) => Entity.Host.parseAsync(x))
  caller.debug = false
  return caller
}
