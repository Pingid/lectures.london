import dayjs from 'dayjs'

import { cn, slugit } from '../util'
import { router } from '../router'

export const LectureListItem = (p: { lecture: Lecture; disableTime?: boolean }) => {
  const params = { host: slugit(p.lecture.host.name), lecture: p.lecture.id }
  const m = router.match('/:host/:lecture', params)
  return (
    <article
      id={p.lecture.id}
      class="group grid [grid-template-columns:3.2rem_1fr] sm:[grid-template-columns:3.9rem_1fr] z-0 scroll-mt-36"
    >
      <div class={cn('pb-2 sm:pr-4 sm:px-3 sm:pt-1')}>
        {!p.disableTime && <p class="sm:text-right">{dayjs(p.lecture.time_start).format('HH:mm')}</p>}
      </div>
      <div class="w-full border-b pb-3 sm:pb-2 sm:pt-1">
        <a
          {...router.link({
            to: '/:host/:lecture',
            params: { host: slugit(p.lecture.host.name), lecture: p.lecture.id },
            state: p.lecture,
          })}
          class={cn('hover:underline underline-offset-4', [
            !!m(),
            'font-medium [text-decoration-color:var(--fg2-color)] hover:[text-decoration-color:var(--fg-color)]',
            '',
          ])}
        >
          <p class="cursor-pointer">{p.lecture.title}</p>
        </a>
      </div>
    </article>
  )
}
