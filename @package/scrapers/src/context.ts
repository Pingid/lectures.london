import * as Entity from './entities'

export interface CrawlerContext {}

type DeepPartial<T> =
  T extends Record<any, any> ? { [P in keyof T]?: DeepPartial<T[P]> } : T extends [] ? DeepPartial<T[number]>[] : T

export const crawler: {
  (fn: (ctx: CrawlerContext) => Promise<DeepPartial<Entity.Host>>): {
    debug?: boolean
    (ctx: CrawlerContext): Promise<Entity.Host>
  }
} = (fn) => {
  const caller = (ctx: CrawlerContext) =>
    fn(ctx).then((x) => {
      const lectures = (x.lectures || []).filter((y): y is Entity.Lecture => Entity.Lecture.safeParse(y).success)
      return Entity.Host.parseAsync({ ...x, lectures })
    })
  caller.debug = false
  return caller
}
