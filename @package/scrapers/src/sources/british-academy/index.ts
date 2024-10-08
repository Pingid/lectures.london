import { crawler } from '../../context'
import { Host } from '../../entities'

const info: Omit<Host, 'lectures'> = {
  name: 'The British Academy',
  website: 'https://www.thebritishacademy.ac.uk',
  icon: 'https://www.thebritishacademy.ac.uk/static/favicon/safari-pinned-tab.d0302baaab29.svg',
}

export const run = crawler(async () => {
  return { ...info, lectures: [] }
})
