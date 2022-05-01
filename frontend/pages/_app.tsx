import type { AppProps } from 'next/app'
import {createGlobalStyle, ThemeProvider} from 'styled-components'
import { create } from 'domain'

const GlobalStyle = createGlobalStyle`
  body, html {
    margin: 0;
    padding: 0;

    font-family: Arial;
  }

  *, *:before, *:after {
    box-sizing: border-box;
  }
`

const theme = {
  colors: {
    success: '##00b01a',
    wrong: "#a11d1d",
    text: "#222"
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
