import Fuse from 'fuse.js'

import { ToWorker, cleanSearchResults } from './search'

let fuse: Fuse<Lecture>

self.onmessage = function (e: { data: ToWorker }) {
  if (e.data.type === 'ADD_LECTURES') {
    const index = Fuse.createIndex(e.data.payload.options.keys, e.data.payload.lectures)
    fuse = new Fuse(e.data.payload.lectures, e.data.payload.options, index)
    self.queueMicrotask(() => self.postMessage({ type: 'CREATED' }))
    return
  }
  if (e.data.type === 'SEARCH') {
    const query = e.data.payload
    self.queueMicrotask(() =>
      self.postMessage({
        type: 'RESULTS',
        payload: cleanSearchResults(fuse.search(query) as any),
      }),
    )
  }
}
