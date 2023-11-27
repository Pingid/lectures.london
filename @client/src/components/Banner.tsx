import { CalenderIcon, GithubIcon } from './Icons'
import { ButtonLink } from './Button'

export const Banner = () => {
  return (
    <div class="sm:px-2 pt-6 space-y-6">
      <div class="space-y-2 sm:columns-1">
        <p class="max-w-sm">Find free to attend lectures from leading universities and institutions around London</p>
        <div class="w-full flex flex-wrap gap-3 pb-2">
          <ButtonLink icon={<CalenderIcon />} rel="noopener noreferrer" target="_blank" href="/calender.ics">
            Calender
          </ButtonLink>
          <ButtonLink icon={<GithubIcon />} href="https://github.com/Pingid/lectures.london" target="_blank">
            Github
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}
