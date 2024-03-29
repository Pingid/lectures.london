export const Head = (p: {
  title: string
  description: string
  url: string
  author: string
  logo: string
  origin: string
  keywords: string[]
}) => {
  return (
    <>
      <title>{p.title}</title>
      <meta name="description" content={p.description} />

      <meta property="og:title" content={p.title} />
      <meta property="og:description" content={p.description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${p.url}/icon.png`} />
      <meta property="og:url" content={p.url} />

      <meta property="og:article:published_time" content={``} />
      <meta property="og:article:modified_time" content={``} />
      <meta property="og:article:expiration_time" content={``} />
      <meta property="og:article:author" content={``} />
      <meta property="og:article:section" content={``} />
      <meta property="og:article:tag" content={``} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content={p.author} />
      <meta name="twitter:title" content={p.title} />
      <meta name="twitter:description" content={p.description} />
      <meta name="twitter:image" content={`${p.url}/icon.png`} />

      <meta name="keywords" content={p.keywords.join(`, `)} />
    </>
  )
}

type MetaTypes =
  | 'title'
  | 'description'
  | 'og:title'
  | 'og:description'
  | 'og:type'
  | 'og:image'
  | 'twitter:card'
  | 'twitter:creator'
  | 'twitter:title'
  | 'twitter:description'
  | 'twitter:image'
  | 'keywords'

export const MetaDisplay = (p: Record<MetaTypes, string>) => {
  return Object.entries(p).map(([name, content]) => {
    if (name === 'title') return <title>{content}</title>
    return <meta name={name} content={content} />
  })
}

export const MetaGlobal = () => (
  <>
    <meta charset="utf-8" />
    <meta name="type" content="website" />
    <meta name="image" content="/icon.png" />
    <meta
      name="viewport"
      content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
    />
    <meta name="theme-color" content="#ffffff" />
    <link rel="manifest" href="/manifest.json"></link>

    <link rel="shortcut icon" href="/favicon.ico" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

    <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
    <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
    <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
    <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
    <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
    <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />

    <meta name="msapplication-TileColor" content="#ffffff" />
    <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />

    <meta name="application-name" content="Lectures London" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Lectures London" />

    <meta name="format-detection" content="telephone=no" />
    <meta name="mobile-web-app-capable" content="yes" />

    <meta name="msapplication-config" content="/browserconfig.xml" />
    <meta name="msapplication-tap-highlight" content="no" />
  </>
)
