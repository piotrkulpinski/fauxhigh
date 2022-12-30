import { createCookieSessionStorage } from '@remix-run/node'

export const storage = createCookieSessionStorage({
  cookie: {
    name: 'fauxhigh-session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: ['AX$bhigT#i'],
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
})

export const { getSession, commitSession, destroySession } = storage
