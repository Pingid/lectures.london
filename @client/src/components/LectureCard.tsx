import { createEffect } from 'solid-js'
import dayjs from 'dayjs'

import { CalenderIcon, LinkIcon } from './Icons'
import { Button, ButtonLink } from './Button'
import { Summary } from './Summary'

export const LectureCard = (p: { lecture: Lecture }) => {
  let ref: HTMLDivElement | null = null
  createEffect(() => {
    const deps = { ...p.lecture }
    setTimeout(() => {
      if (!ref || !deps) return
      ref.scrollTop = 0
    }, 150)
  })

  return (
    <div class="h-full max-h-full overflow-auto" ref={(x) => (ref = x)}>
      <div class="px-4 md:pl-0 md:pr-5 pt-5">
        <h2 onClick={() => document.getElementById(`${p.lecture.id}`)?.scrollIntoView()}>{p.lecture.title}</h2>

        <p class="py-2">{p.lecture.host.name}</p>
        <div class="grid grid-cols-2 gap-3 pt-6">
          <div class="font-medium">
            <p>{p.lecture.time_start && dayjs(p.lecture.time_start).format('MMMM D')}</p>
            <p>
              <time dateTime={p.lecture.time_start}>
                {p.lecture.time_start && dayjs(p.lecture.time_start).format('LT').toLowerCase()}
              </time>
              <time dateTime={p.lecture.time_end}>
                {p.lecture.time_end && dayjs(p.lecture.time_end).format(' - LT').toLowerCase()}
              </time>
            </p>
          </div>
          <div>
            <p class="text-sm sm:text-base">{p.lecture.location}</p>
          </div>
        </div>

        <div class="flex gap-3 mt-5 py-1 justify-between relative border-b border-t">
          <ButtonLink icon={<LinkIcon />} rel="noopener noreferrer" target="_blank" href={p.lecture.link}>
            Event link
          </ButtonLink>
          <div class="group flex">
            <Button
              icon={<CalenderIcon class="w-5 h-5" />}
              tabIndex={0}
              class="whitespace-nowrap peer group-focus-within:w-0 group-focus-within:opacity-0"
            >
              calender
            </Button>
            <div class="w-0 opacity-0 group-focus-within:opacity-100 group-focus-within:w-auto flex gap-3 overflow-hidden">
              <a class="btn" rel="noopener noreferrer" target="_blank" href={`${p.lecture.id}/calender.ics`}>
                apple
              </a>
              <a class="btn" rel="noopener noreferrer" target="_blank" href={`${p.lecture.id}/calender.ics`}>
                outlook
              </a>
              <a class="btn" rel="noopener noreferrer" target="_blank" href={`${p.lecture.id}/calender.ics`}>
                google
              </a>
            </div>
          </div>
        </div>
        <div class="pt-4 overflow-auto pb-24">
          <Summary text={p.lecture.summary || ''} />
        </div>
      </div>
    </div>
  )
}
