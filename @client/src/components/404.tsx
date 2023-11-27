import { ButtonLink } from './Button'
import { ArrowLeftIcon } from './Icons'

export const Page404 = () => (
  <div class="w-full h-[100dvh] flex items-center justify-center">
    <div class="flex flex-col space-y-2">
      <h1>404</h1>
      <h2 class="opacity-50">Page no longer exists</h2>
      <ButtonLink href="/" icon={<ArrowLeftIcon class="w-6 h-6" />} class="text-xl">
        View lectures
      </ButtonLink>
    </div>
  </div>
)
