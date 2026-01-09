import { getEnv } from "../utils/platform"

export default defineEventHandler(async () => {
  const isConfigured = !!getEnv("G_CLIENT_ID") && !!getEnv("G_CLIENT_SECRET") && !!getEnv("JWT_SECRET")
  return {
    enable: isConfigured,
    url: isConfigured ? `https://github.com/login/oauth/authorize?client_id=${getEnv("G_CLIENT_ID")}` : undefined,
  }
})
