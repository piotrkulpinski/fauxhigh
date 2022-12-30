import type { ActionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { TwitterApi } from 'twitter-api-v2'

export const action = async ({ request }: ActionArgs) => {
  // Instantiate with desired auth type (here's Bearer v2 auth)
  const twitterClient = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY ?? '',
    appSecret: process.env.TWITTER_APP_SECRET ?? '',
    accessToken: process.env.TWITTER_ACCESS_TOKEN ?? '',
    accessSecret: process.env.TWITTER_ACCESS_SECRET ?? '',
  })

  // Tell typescript it's a readonly app
  const client = twitterClient.readOnly

  const tweets = await client.v2.userTimeline('twitterdev', {
    max_results: 10,
    expansions: ['author_id'],
  })

  console.log(tweets)

  // Possible status returns: 200 | 404.
  return json({}, { status: 200 })
}

export default () => {
  return null
}
