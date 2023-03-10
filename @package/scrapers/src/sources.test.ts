import * as sources from './sources'

jest.setTimeout(120000)

let toTest = Object.entries(sources)
if (toTest.some((x) => x[1].run.debug)) toTest = toTest.filter((x) => x[1].run.debug)

test.each(toTest)(`%s`, async (name, host) => {
  const result = await host.run({})
  console.log(`${name}: ${result.lectures.length}`)
})
