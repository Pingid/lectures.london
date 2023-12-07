import { For } from 'solid-js'

export const Summary = (props: { lecture: Lecture }) => {
  const cls = 'break-words [columns:auto_35ch] [orphans:7] [column-gap:1rem] my-3'

  if (props.lecture.summary_html?.trim()) {
    return (
      <div class={cls}>
        <div class="prose dark:prose-invert" innerHTML={props.lecture.summary_html} />
      </div>
    )
  }

  if (props.lecture.summary?.trim()) {
    return (
      <div class={cls}>
        <div class="prose dark:prose-invert">
          <For
            each={props.lecture.summary
              .split('\n')
              .map((x) => x.trim())
              .filter(Boolean)}
          >
            {(item) => <p>{item}</p>}
          </For>
        </div>
      </div>
    )
  }

  return null
}
