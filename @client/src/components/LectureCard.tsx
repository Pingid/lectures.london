import { createEffect } from 'solid-js'
import dayjs from 'dayjs'

import { Summary } from './Summary'

export const LectureCard = (props: { lecture: Lecture }) => {
  let ref: HTMLDivElement | null = null
  createEffect(() => {
    const deps = { ...props.lecture }
    setTimeout(() => {
      if (!ref || !deps) return
      ref.scrollTop = 0
    }, 150)
  })

  return (
    <div class="h-full max-h-full overflow-auto" ref={(x) => (ref = x)}>
      <div class="px-4 md:pl-0 md:pr-5 pt-5">
        <h2 class="">{props.lecture.title}</h2>
        <p class="py-2">{props.lecture.host.name}</p>
        <div class="grid grid-cols-2 gap-3 pt-6">
          <div class="font-medium">
            <p class="">{props.lecture.time_start && dayjs(props.lecture.time_start).format('MMMM D')}</p>
            <p>
              <time dateTime={props.lecture.time_start}>
                {props.lecture.time_start && dayjs(props.lecture.time_start).format('LT').toLowerCase()}
              </time>
              <time dateTime={props.lecture.time_end}>
                {props.lecture.time_end && dayjs(props.lecture.time_end).format(' - LT').toLowerCase()}
              </time>
            </p>
          </div>
          <div>
            <p class="text-sm sm:text-base">{props.lecture.location}</p>
          </div>
        </div>

        <div class="flex gap-3 mt-5 py-1 justify-between relative">
          <a class="btn" rel="noopener noreferrer" target="_blank" href={props.lecture.link}>
            Event link
          </a>
          <div class="group flex">
            <button
              class="font-medium border-fg whitespace-nowrap peer group-focus-within:w-0 group-focus-within:opacity-0"
              tabIndex={0}
            >
              calender +
            </button>
            <div class="w-0 opacity-0 group-focus-within:opacity-100 group-focus-within:w-auto flex gap-3 overflow-hidden">
              <a class="btn" rel="noopener noreferrer" target="_blank" href={`${props.lecture.id}/calender.ics`}>
                apple
              </a>
              <a class="btn" rel="noopener noreferrer" target="_blank" href={`${props.lecture.id}/calender.ics`}>
                outlook
              </a>
              <a class="btn" rel="noopener noreferrer" target="_blank" href={`${props.lecture.id}/calender.ics`}>
                google
              </a>
            </div>
          </div>
        </div>
        <div class="pt-4 overflow-auto pb-24">
          <Summary text={props.lecture.summary || ''} />
        </div>
      </div>
    </div>
  )
}
