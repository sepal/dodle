import type { AppProps } from 'next/app'
import {createGlobalStyle, ThemeProvider} from 'styled-components'
import { create } from 'domain'

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

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
    <GlobalStyle />
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
    </>
  )
}

export default MyApp
