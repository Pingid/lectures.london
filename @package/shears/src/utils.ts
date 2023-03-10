import { Shear, Parsed } from './types'
import { render } from 'dom-serializer'

export const map: {
  <A, B, C>(cb: (x: B) => C): (query: Shear<A, B>) => Shear<A, C>
  <A, B, C>(query: Shear<A, B>, cb: (x: B) => C): Shear<A, C>
} = (query: any, cb?: any) => {
  if (!cb) return (qry: any) => (a: any) => qry(a).then(query)
  return (a) => query(a).then(cb)
}

export const html: Shear<Parsed, string | undefined> = (ctx) =>
  Promise.resolve(ctx?.data ? render(ctx?.data) : undefined)
