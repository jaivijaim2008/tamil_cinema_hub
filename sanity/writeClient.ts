import { createClient } from 'next-sanity'
import { noopClient } from './noopClient'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

export const writeClient = projectId
  ? createClient({
      projectId,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2026-05-30',
      useCdn: false,
      token: process.env.SANITY_WRITE_TOKEN,
    })
  : noopClient
