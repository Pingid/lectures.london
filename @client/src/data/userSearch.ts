import { createEffect, createSignal } from 'solid-js'

import { useFuse, SearchResult } from './useFuse'
import { useStore } from './store'
import { router } from '../router'

const sanitize = <T>(x: T): T => JSON.parse(JSON.stringify(x))

export const useSearch = () => {
  const [results, setresults] = createSignal<SearchResult[]>([])
  const [query, setquery] = router.query('query')
  const [data] = useStore()

  const active = () => query().length > 1

  const fuse = useFuse((e) => (e.type === 'RESULTS' ? setresults(e.payload) : null))
  createEffect(() => {
    fuse.send(sanitize({ type: 'ADD_LECTURES', payload: { lectures: data.lectures, options } }))
    if (active()) fuse.send({ type: 'SEARCH', payload: query() })
  })
  createEffect(() => {
    const query = new URLSearchParams(window.location.search).get('query')
    if (query) setquery(query)
  })
  return { results, active }
}

const options = {
  threshold: 0.3,
  maxPatternLength: 32,
  minMatchCharLength: 3,
  includeMatches: true,
  findAllMatches: true,
  ignoreLocation: true,
  includeScore: true,
  shouldSort: true,
  keys: [
    {
      name: 'title',
      weight: 1,
    },
    {
      name: 'summary',
      weight: 0.3,
    },
    {
      name: 'host.name',
      weight: 0.8,
    },
  ],
}
