import { test } from 'vitest'
import * as sources from './sources'

let toTest = Object.entries(sources)
if (toTest.some((x) => x[1].run.debug)) toTest = toTest.filter((x) => x[1].run.debug)

test.each(toTest)(`%s`, { timeout: 120000, concurrent: true }, async (name, host) => {
  const result = await host.run({})
  console.log(`${name}: ${result.lectures.length}`)
})
