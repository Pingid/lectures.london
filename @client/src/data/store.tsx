import { createEffect, createContext, JSXElement, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

const initial = {
  lectures: [] as Lecture[],
  loading: true,
}

export const StoreContext = createContext<ReturnType<typeof getStore>>([{} as any, {} as any])
export const StoreProvider = (props: { store: ReturnType<typeof getStore>; children: JSXElement }) => (
  <StoreContext.Provider value={props.store}>{props.children}</StoreContext.Provider>
)
export const useStore = () => useContext(StoreContext)

export const getStore = (props: Partial<typeof initial>) => {
  const [state, set] = createStore({ ...initial, ...props })

  // Initial load of lectures and hosts
  createEffect(() => {
    set('loading', true)
    import('../../lectures.json')
      .then((x) => set('lectures', x.default))
      .finally(() => {
        set('loading', false)
      })
  })

  return [state, { set }] as const
}
