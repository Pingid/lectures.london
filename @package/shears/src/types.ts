import * as dh from 'domhandler'

export type Parsed = dh.AnyNode | dh.AnyNode[]

export interface Context<A> {
  data: A
}

export interface Shear<A, B> {
  (ctx?: Context<A>): Promise<B>
}

export type Typeof<T> = T extends Shear<any, infer I> ? Awaited<I> : never

export type Last<T extends any[]> = T extends [...any[], infer D] ? D : never

export type CountArrayDepth<A, B> = A extends []
  ? B
  : A extends [infer H, ...infer R]
    ? H extends [any]
      ? CountArrayDepth<R, B[]>
      : CountArrayDepth<R, B>
    : never
