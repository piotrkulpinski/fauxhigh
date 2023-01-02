import type { ActionArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { bearer, client } from '~/services/client.server'

export const loader = async () => {
  return json({ status: 405, message: 'Method Not Allowed' })
}

export const action = async ({ request }: ActionArgs) => {
  try {
    if (request.method !== 'POST') {
      throw json({ status: 405, message: 'Method Not Allowed' })
    }

    const authorization = request.headers.get('Authorization')

    if (authorization !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      throw json({ status: 401, message: 'Access forbidden' })
    }

    const tweets = await bearer.v2.search('#buildinpublic')

    for (const tweet of tweets) {
      await client.v2.like(process.env.TWITTER_APP_ID ?? '', tweet.id)
    }

    return json({ status: 200, success: true })
  } catch (error) {
    console.log(error)

    return json({ status: 500, message: (error as Error).message })
  }
}
