import { createEffect, onCleanup } from 'solid-js'
import type Fuse from 'fuse.js'

import { FromWorker, ToWorker, cleanSearchResults } from '../worker/search'
export type { SearchResult } from '../worker/search'

export const useFuse = (onMessage: (ev: FromWorker) => any) => {
  if (typeof Worker !== 'undefined') {
    let worker: Worker | null = null
    const send = (data: ToWorker) => Promise.resolve(worker?.postMessage(data))
    createEffect(() => {
      worker = new window.Worker('/search.worker.js')
      worker.onmessage = (ev: MessageEvent<FromWorker>) => onMessage(ev.data)
      onCleanup(() => worker?.terminate())
    })
    return { send }
  }

  let fuse: Fuse<Lecture>
  const send = async (data: ToWorker) => {
    if (data.type === 'ADD_LECTURES') {
      const Fuse = await import('fuse.js').then((x) => x.default)
      const index = Fuse.createIndex(data.payload.options.keys, data.payload.lectures)
      fuse = new Fuse(data.payload.lectures, data.payload.options, index)
    }
    if (data.type === 'SEARCH') {
      onMessage({ type: 'RESULTS', payload: cleanSearchResults(fuse.search(data.payload) as any) })
    }
  }
  return { send }
}
