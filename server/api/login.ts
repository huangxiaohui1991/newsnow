import process from "node:process"

export default defineEventHandler(async (event) => {
  if (!process.env.G_CLIENT_ID) {
    throw createError({ statusCode: 506, message: "GitHub Client ID is not configured. Please set G_CLIENT_ID in your environment." })
  }
  sendRedirect(event, `https://github.com/login/oauth/authorize?client_id=${process.env.G_CLIENT_ID}`)
})
