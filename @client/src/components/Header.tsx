import { cn } from 'mcn'

import { ArrowLeftIcon } from './Icons'
import { router } from '../router'

export const Header = () => {
  const [value, update] = router.query('query')
  const m = router.match('/:host/:lecture')
  const [state, api] = router.use()
  const shouldGoBack = () =>
    /http:\/\/localhost|lectures\.london/.test(state.previous?.url || '') && state.previous?.pathname === '/'

  return (
    <div class="px-2 md:px-3 sticky top-0 z-20 bg-bg [height:var(--header-height)] flex items-end">
      <div class={cn('py-2 sm:p-2 flex items-end w-full border-b')}>
        <a
          class={cn('leading-4 w-min', [!!m(), 'hidden md:block'])}
          {...router.link({ to: '/', params: {}, state: {} })}
        >
          lectures london
        </a>
        <a
          {...router.link({ to: '/', params: {}, state: {} })}
          class={cn('border-fg whitespace-nowrap flex items-end gap-2 leading-none', [
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
          <ArrowLeftIcon class="w-6 h-6 relative top-1.5" />
          {shouldGoBack() ? 'back' : 'lectures'}
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
