import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/7a91c6a9f13bf53b1d4aac95b33da54729a974ba29fe34a62167c18b2fc40f17.sqlite',
  },
});
