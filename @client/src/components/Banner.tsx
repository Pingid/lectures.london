export const Banner = () => {
  return (
    <div class="sm:px-2 pt-6 space-y-6">
      <div class="space-y-2 sm:columns-1">
        <p class="max-w-sm">Find free to attend lectures from leading universities and institutions around London</p>

        <div class="w-full flex flex-wrap gap-3 pb-2">
          <a class="btn" rel="noopener noreferrer" target="_blank" href="https://twitter.com/lectures_london">
            twitter
          </a>
          <a class="btn" rel="noopener noreferrer" target="_blank" href="/calender.ics">
            calender
          </a>
          <label for="more" class="btn w-min cursor-pointer sm:hidden">
            issues
          </label>
        </div>
        <input id="more" type="checkbox" class="peer hidden" />
        <p class="invisible h-0 sm:h-auto sm:visible peer-checked:h-auto peer-checked:visible text-sm">
          If you spot any problems or mistakes on the site please file an{' '}
          <a
            class="btn text-sm"
            rel="noopener noreferrer"
            target="_blank"
            href={`https://github.com/Pingid/lectures.london/issues`}
          >
            issue
          </a>
          . Or get in contact through{' '}
          <a class="btn text-sm" rel="noopener noreferrer" target="_blank" href="https://twitter.com/lectures_london">
            twitter
          </a>
        </p>
      </div>
    </div>
  )
}
