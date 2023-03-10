export const config = {
  title: 'Lectures London',
  description:
    'Public talks and lectures hosted by institutes and universities in London on topics including law, art sustainability, philosophy, history, economics and much more',
  author: 'Dan Beaven',
  url: import.meta.env.SITE_URL,
  logo: '/icon.png',
  keywords: ['lectures', 'london'],
}

export type Config = typeof config
