// Messaging
export type SearchResult = {
  item: Lecture
  matches: { key: keyof Lecture; value: string; indices: [number, number][] }[]
  score: number
}

export type ToWorker =
  | { type: 'ADD_LECTURES'; payload: { lectures: Lecture[]; options: any } }
  | { type: 'SEARCH'; payload: string }

export type FromWorker = { type: 'CREATED' } | { type: 'RESULTS'; payload: SearchResult[] }

// Clean results
export const cleanSearchResults = (results: SearchResult[]) => {
  return uniqBy(
    results.map((x) => x),
    (a, b) => a.item.id === b.item.id,
  )
}

// Utility
const uniqBy = <T>(arr: T[], fn: (a: T, b: T) => boolean) =>
  arr.reduce((a, b) => (a.some((x) => fn(x, b)) ? a : [...a, b]), [] as T[])
