import { createEffect, onCleanup, JSX, createMemo, createContext, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

export const createRouter = <T extends Record<string, any>>() => {
  const initial = { url: 'http://server.com', state: {} }

  // Context
  const Context = createContext<ReturnType<typeof create>>([{} as any, {} as any])
  const Provider = (props: { store: ReturnType<typeof create>; children: JSX.Element }) => (
    <Context.Provider value={props.store}>{props.children}</Context.Provider>
  )
  const userRouter = () => useContext(Context)

  // Store
  const create = <K extends keyof T & string>(props: { key: K; params: PathParams<K>; state: T[K] }) => {
    const origin = () => (typeof window === 'undefined' ? 'http://server.com' : window.location.origin)
    const pathname = build(props.key as any, props.params as any)

    const [state, set] = createStore({
      ...initial,
      url: `${origin()}${pathname}`,
      state: props.state,
      previous: null as null | Partial<Record<'pathname' | 'url', string>>,
      query: '',
    })

    createEffect(() => {
      const handler = (e: PopStateEvent) => {
        set({ url: window.location.href, state: e?.state?.data, previous: e?.state?.previous })
      }
      window.addEventListener('popstate', handler)
      onCleanup(() => window.removeEventListener('popstate', handler))
    })

    const interupt =
      (name: keyof typeof window.history) =>
      <K extends keyof T>(key: K, params: PathParams<K>, state: T[K]) => {
        const url = build(key as string, params)
        const previous = { url: window.location.href, pathname: window.location.pathname }
        window.history[name]({ data: state, previous }, '', url)
        set({ previous, state, url })
      }

    return [
      state,
      { set, push: interupt('pushState'), replace: interupt('replaceState'), back: interupt('back') },
    ] as const
  }

  // create ancher tag props
  const link = <K extends keyof T & string>(p: {
    to: K
    type?: 'push' | 'replace'
    state: T[K]
    params: PathParams<K>
    hash?: string
  }) => {
    const [, router] = userRouter()
    const href = build(p.to, p.params)
    return {
      href,
      onClick: function (this: any, e: MouseEvent & { currentTarget: HTMLAnchorElement; target: Element }) {
        const url = window.location.origin + href + window.location.search + (p.hash ? `#${p.hash}` : '')
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
        e.preventDefault()
        if (p.type === 'replace') router.replace(url, p.params, JSON.parse(JSON.stringify(p.state)))
        else router.push(url, p.params, JSON.parse(JSON.stringify(p.state)))
      },
    }
  }

  // path key matches current url
  const match = <K extends keyof T & string>(key: K, params?: PathParams<K>) => {
    const pattern = new URLPattern({ pathname: params ? build(key, params) : key })
    const [state] = userRouter()

    return createMemo(() => {
      const pth = state.url
      const st = state.state as T[K]
      const m = pattern.exec(pth)
      if (!m) return null
      const params = m.pathname.groups as PathParams<K>
      return { active: true, params, state: st } as const
    })
  }

  // Create a query parameter hook
  const query = <K extends string>(key: K) => {
    const [state, router] = userRouter()

    const value = () => {
      let q = state.query
      try {
        return new URLSearchParams(new URL(state.url).search).get(key) || ''
      } catch (e) {
        return q
      }
    }

    const onChange = (value: string) => {
      const url = new URL(state.url)
      const q = new URLSearchParams(url.search)

      if (!value) q.delete(key)
      else q.set(key, value)

      const query = q.toString()
      router.set('query', query)
      const next = `${url.origin}${url.pathname}${query ? `?${query}` : ''}`
      window.history.replaceState(JSON.stringify(state.url), '', next)
      router.set('url', next)
    }

    return [value, onChange] as const
  }

  return { match, query, Provider, create, use: userRouter, link }
}

const build = (key: string, params: Record<string, string>): string =>
  key
    .split('/')
    .map((x: string) => (/^:/.test(x) ? params?.[x.replace(/^:/, '')] : x))
    .join('/')

type PathParams<K, T extends Record<string, string> = {}> = K extends `${string}:${infer D}/${infer R}`
  ? PathParams<R, T & { [K in D]: string }>
  : K extends `${string}:${infer D}`
    ? T & { [K in D]: string }
    : T
