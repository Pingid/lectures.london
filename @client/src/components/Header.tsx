import { router } from '../router'
import { cn } from 'mcn'

export const Header = () => {
  const [value, update] = router.query('query')
  const m = router.match('/:host/:lecture')
  const [state, api] = router.use()
  const shouldGoBack = () =>
    /http:\/\/localhost|lectures\.london/.test(state.previous?.url || '') && state.previous?.pathname === '/'

  return (
    <div class="px-2 md:px-3 sticky top-0 z-20 bg-bg [height:var(--header-height)] flex items-end">
      <div class={cn('py-2 sm:p-2 flex items-end w-full', [!!m(), 'md:border-b', 'border-b'])}>
        <a
          class={cn('leading-4 w-min', [!!m(), 'hidden md:block'])}
          {...router.link({ to: '/', params: {}, state: {} })}
        >
          lectures london
        </a>
        <a
          {...router.link({ to: '/', params: {}, state: {} })}
          class={cn('font-medium border-b-2 border-fg whitespace-nowrap flex items-center ml-2', [
            !!m(),
            'block md:hidden',
            'hidden',
          ])}
          onClick={(e) => {
            e.preventDefault()
            if (shouldGoBack()) api.back('/', {}, {})
            else api.push('/', {}, {})
          }}
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 512 512"
            height="1.3rem"
            width="1.3rem"
            class="-ml-[8px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M320 128L192 256l128 128z"></path>
          </svg>
          <span>{shouldGoBack() ? 'back' : 'lectures'}</span>
        </a>
        <input
          class={cn('bg-transparent flex-1 px-3 focus:outline-none text-base relative top-1', [
            !!m(),
            'hidden md:block',
          ])}
          placeholder="Search"
          onInput={(e: any) => update(e.target.value || '')}
          value={value() || ''}
        />
      </div>
    </div>
  )
}
