import { JSX } from 'solid-js/jsx-runtime'
import { cn } from 'mcn'

const buttonClass = cn('flex gap-1 items-center hover:opacity-75')
const iconClass = cn('grid relative')

export const Button = ({ icon, children, ...props }: JSX.IntrinsicElements['button'] & { icon?: JSX.Element }) => {
  return (
    <button {...props} class={cn(buttonClass, props.class)}>
      <span class={iconClass}>{icon}</span>
      <span>{children}</span>
    </button>
  )
}

export const ButtonLink = ({ icon, children, ...props }: JSX.IntrinsicElements['a'] & { icon?: JSX.Element }) => {
  return (
    <a {...props} class={cn(buttonClass, props.class)}>
      <span class={iconClass}>{icon}</span>
      <span>{children}</span>
    </a>
  )
}
