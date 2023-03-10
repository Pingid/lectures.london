export type ClassNames =
  | string
  | number
  | null
  | undefined
  | readonly [boolean, ClassNames, ClassNames?]
  | { readonly [x: string]: boolean }

type TypeofClassName<C> = C extends null | undefined
  ? ''
  : C extends readonly [any, infer A]
  ? TypeofClassName<A>
  : C extends readonly [any, infer A, infer B]
  ? TypeofClassName<A> | TypeofClassName<B>
  : C extends Record<string, any>
  ? keyof C
  : C

type Join<T> = T extends [infer I, ...infer R] ? `${I & string} ${Join<R>}` : ''

// -----------------------------------------------------------------
// Join className variants
// -----------------------------------------------------------------
export const cn = <T extends ClassNames[]>(...args: T): Join<{ [K in keyof T]: TypeofClassName<T[K]> }> =>
  args.reduce<any>((a, b) => {
    if (!b) return a
    if (typeof b === 'string') return (a + ' ' + b).trim()
    if (Array.isArray(b)) return cn(a, b[0] ? b[1] : b[2])
    if (typeof b === 'object') return cn(a, ...(Object.entries(b).map((x) => x.reverse()) as any[]))
    return a
  }, '')
