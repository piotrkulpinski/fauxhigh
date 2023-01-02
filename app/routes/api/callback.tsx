import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { TwitterApi } from 'twitter-api-v2'
import { destroySession, getSession } from '~/services/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get('cookie'))
  const url = new URL(request.url)

  const codeVerifier = session.get('codeVerifier')
  const sessionState = session.get('state')
  const state = url.searchParams.get('state') || null
  const code = url.searchParams.get('code') || null

  if (!codeVerifier || !state || !sessionState || !code) {
    throw new Error('You denied the app or your session expired!')
  }
  if (state !== sessionState) {
    throw new Error('Stored tokens didnt match!')
  }

  // Obtain access token
  const client = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID ?? '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
  })

  try {
    const { accessToken, refreshToken } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: process.env.TWITTER_CALLBACK_URL ?? '',
    })

    return json(
      { accessToken, refreshToken },
      {
        headers: { 'Set-Cookie': await destroySession(session) },
      },
    )
  } catch {
    throw new Error('Invalid verifier or access tokens!')
  }
}

export default () => {
  const { accessToken, refreshToken } = useLoaderData<typeof loader>()

  return (
    <>
      Access Token: {accessToken}
      <br />
      Refresh Token: {refreshToken}
    </>
  )
}
