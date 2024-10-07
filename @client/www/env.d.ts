/// <reference path="../.astro/types.d.ts" />
/// <reference types="urlpattern-polyfill" />
/// <reference types="astro/client" />

import type lecture from '../lectures.json'
import type host from '../host.json'

declare global {
  type Host = (typeof host)[number]
  type Lecture = (typeof lecture)[number]
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
  interface ImportMeta {
    env: { GA_TRACKING_ID: string; URL: string }
  }
}
