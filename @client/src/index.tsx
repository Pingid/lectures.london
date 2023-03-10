import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import { Show } from 'solid-js'
import dayjs from 'dayjs'

import { LectureCard } from './components/LectureCard'
import { LectureList } from './components/LectureList'
import { Banner } from './components/Banner'
import { Header } from './components/Header'

import { useSearch, StoreProvider, getStore, useStore } from './data'
import { router } from './router'
import { cn } from './util'

dayjs.extend(LocalizedFormat)

export const Page = (props: { data: Parameters<typeof getStore>[0]; page: Parameters<typeof router.create>[0] }) => {
  return (
    <router.Provider store={router.create(props.page)}>
      <StoreProvider store={getStore(props.data)}>
        <Header />
        <Layout />
      </StoreProvider>
    </router.Provider>
  )
}

const Layout = () => {
  const match = router.match('/:host/:lecture')
  const [data] = useStore()
  const search = useSearch()

  const talks = () => (search.active() ? search.results().map((x) => x.item) : data.lectures)

  return (
    <div
      class={cn('grid w-full', [
        !!match(),
        '[grid-template-columns:1fr] md:gap-3 md:[grid-template-columns:1fr_1fr]',
        'md:[grid-template-columns:1fr_0]',
      ])}
    >
      <div class={cn('pl-3', [!!match(), 'hidden md:block', 'pr-3'])}>
        <Banner />
        <LectureList lectures={talks()} loading={data.loading} />
      </div>
      <div
        class={cn('sticky top-[var(--header-height)] w-full bg-bg overflow-hidden [height:var(--body-height)]', [
          !match(),
          'hidden',
        ])}
      >
        <Show when={match()} keyed={true}>
          {(m) => <LectureCard lecture={m.state} />}
        </Show>
      </div>
    </div>
  )
}
