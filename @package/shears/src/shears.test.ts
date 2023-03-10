import { parseDocument } from 'htmlparser2'
import { query } from './query'

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

jest.setTimeout(60000)

// const map: {
//   <A, B, C>(cb: (x: B) => C): (query: Shear<A, B>) => Shear<A, C>
//   <A, B, C>(query: Shear<A, B>, cb: (x: B) => C): Shear<A, C>
// } = (query: any, cb?: any) => {
//   if (!cb) return (qry: any) => (a: any) => qry(a).then(query)
//   return (a) => query(a).then(cb)
// }

// it.only('should handle nested', async () => {
//   const r = await goto(
//     'https://www.ox.ac.uk/events-list?type=200',
//     query(['.view-content .node-event'], {
//       title: 'a',
//       link: map(query('a@href'), (x) => (x ? `https://www.ox.ac.uk${x}` : undefined)),
//       merge: goto(
//         'a@href',
//         query({
//           // free: map(query('.field-name-field-event-cost > span'), (x) => /free/gim.test(x || '')),
//           k: '.field-name-field-event-booking-url a@href',
//         }),
//       ),
//     }),
//   ).paginate('li.next a@href', 1)()

//   console.log(r.flat().map((x) => ({ ...x, ...x.merge })))
// })
