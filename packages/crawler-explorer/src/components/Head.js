import React from 'react'
import NextHead from 'next/head'

const Head = () => {
  return (
    <NextHead>
			<title>Crawler SDK Explorer</title>
      <meta charSet='utf-8' />
      <meta name="description" content="Crawler SDK Explorer" />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <link rel="icon" href="/favicon.ico" />
    </NextHead>
  )
}

export default Head
