import { For } from 'solid-js'
import dayjs from 'dayjs'
import { cn } from 'mcn'

import { LectureListItem } from './LectureItem'

export const LectureList = (props: { lectures: Lecture[]; loading?: boolean }) => {
  return (
    <div class="w-full">
      <div class="relative -z-0 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-2 sm:gap-1">
        <For each={props.lectures}>
          {(lecture, i) => {
            const current_day = dayjs(lecture.time_start).startOf('day')
            const previous_day = props.lectures[i() - 1]
            const previous_day_date = previous_day ? dayjs(previous_day.time_start).startOf('day') : undefined
            const next_day = !current_day.isSame(previous_day_date)

            const current_month = current_day.startOf('month')
            const previous_month = previous_day_date?.startOf('month')
            const next_month = !current_month.isSame(previous_month)

            // const current_year = current_day.startOf('year')
            // const previous_year = previous_day_date?.startOf('year')
            // const next_year = !current_year.isSame(previous_year)

            const disableTime = !!(
              previous_day &&
              !next_day &&
              !next_month &&
              dayjs(previous_day.time_start).format('HH:mm') === dayjs(lecture.time_start).format('HH:mm')
            )

            return (
              <>
                {next_day && (
                  <div class="bg-bg sticky top-[var(--header-height)] pt-0 z-20 mt-6 border-b flex justify-between">
                    <p class="py-2 sm:px-2">{dayjs(current_day).format(`dddd`)}</p>
                    <p class="py-2 sm:px-2">{dayjs(current_day).format(`MMM D`)}</p>
                  </div>
                )}
                <LectureListItem lecture={lecture} disableTime={disableTime} />
              </>
            )
          }}
        </For>
      </div>
      <h4 class="w-full text-center my-12">
        {!props.loading ? (
          'end'
        ) : (
          <span class={cn('transition-all', [props.loading, 'animate-pulse opacity-100', 'opacity-0'])}>Loading</span>
        )}
      </h4>
    </div>
  )
}
