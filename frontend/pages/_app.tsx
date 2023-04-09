import type { AppProps } from 'next/app'
import { createGlobalStyle, ThemeProvider } from 'styled-components'
import { create } from 'domain'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect, useReducer } from 'react'
import { useRouter } from 'next/router'

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;

    font-family: Arial;
    font-size: 16px;
    line-height: 1.5;
  }

  *, *:before, *:after {
    box-sizing: border-box;
  }

  p, div, section {
      margin: 0 0 1.5em 0;
  }
`

const theme = {
  colors: {
    primary: '#5c5eff',
    success: '##00b01a',
    wrong: "#a11d1d",
    text: "#222",
    border: "#f0f0f0",
  },
}

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    // Disable in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.opt_out_capturing()
    }
  })
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture('$pageview')
    router.events.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [])


  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={theme}>
        <PostHogProvider client={posthog}>
          <Component {...pageProps} />
        </PostHogProvider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
