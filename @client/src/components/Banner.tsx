export const Banner = () => {
  return (
    <div class="sm:px-2 py-6 space-y-6 max-w-3xl">
      <div class="space-y-2 sm:columns-2">
        <p>Find free to attend lectures from leading universities and institutions around London</p>
        <p>
          You can find the code on our{' '}
          <a class="btn" rel="noopener noreferrer" target="_blank" href={`https://github.com/Pingid/lectures.london`}>
            repository
          </a>
          , where we welcome contributions and feedback. This is a community lead project and if you spot any problems
          or mistakes on the site please file an{' '}
          <a
            class="btn"
            rel="noopener noreferrer"
            target="_blank"
            href={`https://github.com/Pingid/lectures.london/issues`}
          >
            issue
          </a>
          . For those more technically minded a pull request with a fix is always appreciated.
        </p>
      </div>
      <div class="w-full flex flex-wrap gap-3">
        <a class="btn" rel="noopener noreferrer" target="_blank" href="https://twitter.com/lectures_london">
          twitter
        </a>
        <a class="btn" rel="noopener noreferrer" target="_blank" href="/calender.ics">
          calender
        </a>
        <a class="btn" rel="noopener noreferrer" target="_blank" href="/rss.xml">
          rss
        </a>
      </div>
    </div>
  )
}
