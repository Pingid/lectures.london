import { crawler } from '../../context.js'
import { Host } from '../../entities.js'

const info: Omit<Host, 'lectures'> = {
  name: 'The British Academy',
  website: 'https://www.thebritishacademy.ac.uk',
  icon: 'https://www.thebritishacademy.ac.uk/static/favicon/safari-pinned-tab.d0302baaab29.svg',
}

export const run = crawler(async () => {
  return { ...info, lectures: [] }
})
