import { createRouter } from './util'

export const router = createRouter<{
  '/': any
  '/:host': any
  '/:host/:lecture': Lecture
}>()
