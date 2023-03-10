import { For } from 'solid-js'

export const Summary = (props: { text: string }) => {
  return (
    <div class="break-words space-y-3 [columns:auto_35ch] [orphans:7] [column-gap:1rem]">
      <For each={props.text.split('\n')}>
        {(item) => (
          <p class="text-sm sm:text-base">
            {item}
            <br />
          </p>
        )}
      </For>
    </div>
  )
}
