import type { LoaderArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { TwitterApi } from 'twitter-api-v2'
import { commitSession, getSession } from '~/services/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get('cookie'))
  const url = new URL(request.url)

  const codeVerifier = session.get('codeVerifier')
  const sessionState = session.get('state')
  const state = url.searchParams.get('state') || null
  const code = url.searchParams.get('code') || null

  if (!codeVerifier || !state || !sessionState || !code) {
    return json('You denied the app or your session expired!', { status: 400 })
  }
  if (state !== sessionState) {
    return json('Stored tokens didnt match!', { status: 400 })
  }

  // Obtain access token
  const client = new TwitterApi({
    clientId: process.env.TWITTER_CLIENT_ID ?? '',
    clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
  })

  await client
    .loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: process.env.TWITTER_CALLBACK_URL ?? '',
    })
    .then(async ({ accessToken, refreshToken }) => {
      console.log(accessToken, refreshToken)

      session.set('accessToken', accessToken)
      session.set('refreshToken', refreshToken)
    })
    .catch(() => json('Invalid verifier or access tokens!', { status: 403 }))

  return redirect('/', {
    headers: { 'Set-Cookie': await commitSession(session) },
  })
}
