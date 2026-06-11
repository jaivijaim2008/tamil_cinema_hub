import { client } from '../../sanity/client'
import AboutPageClient from './AboutPageClient'

export default async function AboutPage() {
  let totalCount = 0
  let directorCount = 0

  try {
    ;[totalCount, directorCount] = await Promise.all([
      client.fetch<number>(`count(*[_type == "movie"])`).catch(() => 0),
      client.fetch<number>(`count(array::unique(*[_type == "movie"].director[]))`).catch(() => 0),
    ])
  } catch {}

  return <AboutPageClient totalCount={totalCount} directorCount={directorCount} />
}
