export default () => ({
  shopifyApiKey: process.env.SHOPIFY_API_KEY,
  shopifySecretKey: process.env.SHOPIFY_SECRET_KEY,
  shopifyApiVersion: process.env.SHOPIFY_API_VERSION || '2021-10',
  appDomain: process.env.APP_DOMAIN,
  dbUri: process.env.DB_URI,
  port: process.env.PORT || 5000,
  isEmbedded: process.env.IS_EMBEDDED || true,
  sentryDsn: process.env.SENTRY_DSN,
  environment: process.env.ENVIRONMENT,
});
