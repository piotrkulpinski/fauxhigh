import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { TwitterApi } from 'twitter-api-v2'
import { commitSession, getSession } from '~/services/session.server'

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get('cookie'))
  const accessToken = session.get('accessToken')

  const client = new TwitterApi(
    accessToken ?? {
      clientId: process.env.TWITTER_CLIENT_ID ?? '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
    },
  )

  if (!accessToken) {
    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(
      process.env.TWITTER_CALLBACK_URL ?? '',
      { scope: ['tweet.read', 'users.read', 'like.write', 'offline.access'] },
    )

    session.set('codeVerifier', codeVerifier)
    session.set('state', state)

    return json(
      { url },
      { status: 200, headers: { 'Set-Cookie': await commitSession(session) } },
    )
  }

  try {
    const { data: userData } = await client.v2.me()
    const tweets = await client.v2.search('#buildinpublic')

    for (const tweet of tweets) {
      await client.v2.like(userData.id, tweet.id)
    }
  } catch (e) {
    console.log(e)
  }

  // Possible status returns: 200 | 404.
  return json(
    { url: null },
    { status: 200, headers: { 'Set-Cookie': await commitSession(session) } },
  )
}

export default () => {
  const { url } = useLoaderData<typeof loader>()

  return <>{url && <a href={url}>Sign in with Twitter</a>}</>
}
