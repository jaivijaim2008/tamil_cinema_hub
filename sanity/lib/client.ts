import { createClient } from 'next-sanity'
import { noopClient } from '../noopClient'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
      useCdn: true,
    })
  : noopClient
