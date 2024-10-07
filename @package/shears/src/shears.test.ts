import { parseDocument } from 'htmlparser2'
import { it, expect } from 'vitest'

import { query } from './query'
import { goto } from './goto'

const html = (t: { raw: readonly string[] | ArrayLike<string> }, ...s: any[]) => ({
  data: parseDocument(String.raw(t, ...s)) as any,
  origin: 'local',
})

it('should select text with plain string', async () =>
  expect(await query('h1')(html`<div><h1>foo</h1></div>`)).toBe('foo'))

it('should select text from multiple', async () =>
  expect(await query(['h1'])(html`<div><h1>foo</h1></div>`)).toEqual(['foo']))

it('should select nested query', async () =>
  expect(await query(query('h1'))(html`<div><h1>foo</h1></div>`)).toEqual('foo'))

it('should select nested query', async () => {
  const c = html`<div>
    <h1><span>foo</span></h1>
    <p><span>bar</span></p>
  </div>`
  expect(await query('p', ['span'])(c)).toEqual(['bar'])
})

it('should select double nested query', async () => {
  const c = html`<div>
    <h1><span>foo</span></h1>
    <p><span>bar</span></p>
  </div>`
  expect(await query(['p'], ['span'])(c)).toEqual([['bar']])
})

it('should select object query', async () => {
  const c = html`<div>
    <h1>foo</h1>
    <a href="bar"></a>
  </div>`
  expect(await query({ a: 'h1', b: 'a@href' })(c)).toEqual({ a: 'foo', b: 'bar' })
})

it('should select object on all', async () => {
  const c = html`<div>
    <div><p>foo</p></div>
    <div><p>bar</p></div>
  </div>`
  expect(await query(['div div'], { a: 'p' })(c)).toEqual([{ a: 'foo' }, { a: 'bar' }])
})

it('should handle goto url', async () => {
  const url = 'http://foo.com'
  const go = goto.use({ driver: (page) => Promise.resolve({ data: `<p>${page}</p>` }) })
  const result = await go(url, query('p'))()
  expect(result).toBe(url)
})

it('should handle goto selector', async () => {
  const go = goto.use({ driver: () => Promise.resolve({ data: `<p>Page 2</p>` }) })
  const ctx = html`<div><a href="http://foo.com">bar</a></div>`
  const result = await query({ page: go('a@href', query('p')) })(ctx)
  expect(result).toEqual({ page: 'Page 2' })
})

it('should handle pagination', async () => {
  const go = goto.use({
    driver: (url: string) => Promise.resolve({ data: `<div><p>${url}</p>><a href="${url}">next</a></div>` }),
  })
  const ctx = html`<div><a href="http://foo.com">bar</a></div>`
  const result = await query({
    page: go('a@href', query('p'), { paginate: { selector: 'a@href', limit: 2 } }),
  })(ctx)

  expect(result).toEqual({ page: ['http://foo.com', 'http://foo.com', 'http://foo.com'] })
})
