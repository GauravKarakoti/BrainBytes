declare module '*.svg?url' {
  import { StaticImport } from 'next/image'

  const content: StaticImport | string
  export default content
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      STRIPE_API_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      AUTH0_ADMIN_IDS: string;
    }
  }
}
