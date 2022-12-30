import { TwitterApi } from 'twitter-api-v2'

export const likeRecentTweets = async (
  token: string,
  query: string = '#buildinpublic',
) => {
  const client = new TwitterApi(token)

  try {
    const { data: userData } = await client.v2.me()
    const tweets = await client.v2.search(query)

    for (const tweet of tweets) {
      await client.v2.like(userData.id, tweet.id)
    }
  } catch (e) {
    console.log(e)
  }
}
