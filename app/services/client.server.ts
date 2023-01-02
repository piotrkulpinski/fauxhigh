import { TwitterApi } from 'twitter-api-v2'

export const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY ?? '',
  appSecret: process.env.TWITTER_API_SECRET ?? '',
  accessToken: process.env.TWITTER_ACCESS_TOKEN ?? '',
  accessSecret: process.env.TWITTER_ACCESS_SECRET ?? '',
}).readWrite

export const bearer = new TwitterApi(process.env.TWITTER_BEARER_TOKEN ?? '')
  .readOnly
