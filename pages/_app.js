import NextApp from 'next/app'
import React from 'react'
import {Analytics} from '@vercel/analytics/react'

import 'bootstrap/scss/bootstrap.scss'
import '../scss/darkmode.scss'

class App extends NextApp {
  render() {
    const {Component, pageProps} = this.props
    return (
      <>
        <Component {...pageProps} />
        <Analytics />
      </>
    )
  }
}

export default App
