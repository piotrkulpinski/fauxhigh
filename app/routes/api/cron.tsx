import type { ActionArgs } from '@remix-run/server-runtime'
import { json } from '@remix-run/server-runtime'
import { getSession } from '~/services/session.server'
import { likeRecentTweets } from '~/services/twitter.server'

export const loader = async () => {
  return json({ status: 405, message: 'Method Not Allowed' })
}

export const action = async ({ request }: ActionArgs) => {
  if (request.method !== 'POST') {
    return json({ status: 405, message: 'Method Not Allowed' })
  }

  try {
    const authorization = request.headers.get('Authorization')

    if (authorization !== `Bearer ${process.env.CRON_SECRET_KEY}`) {
      return json({ status: 401, message: 'Access forbidden' })
    }

    const session = await getSession(request.headers.get('cookie'))
    const token = session.get('accessToken') ?? process.env.TWITTER_ACCESS_TOKEN

    if (token) {
      try {
        await likeRecentTweets(token, '#buildinpublic')
      } catch (error) {
        return json({ status: 500, message: (error as Error).message })
      }
    }

    return json({ status: 200, success: true })
  } catch (error) {
    return json({ status: 500, message: (error as Error).message })
  }
}
