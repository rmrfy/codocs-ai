// const { Probot } = require("probot");
// require("dotenv").config();

// module.exports = (app) => {
//   // Log every event received for debugging
//   app.onAny(async (context) => {
//     console.log(`Received event: ${context.name}`);
//   });

//   // Listen for pull request opened event
//   app.on("pull_request.opened", async (context) => {
//     const pr = context.payload.pull_request;
//     console.log(`New PR created: #${pr.number} - ${pr.title}`);
//   });
// };

// // Start the app if running directly
// if (require.main === module) {
//   Probot.run({
//     appId: process.env.APP_ID,
//     privateKey: process.env.PRIVATE_KEY,
//     secret: process.env.WEBHOOK_SECRET,
//   });
// }




import dotenv from 'dotenv'
import http from 'http'
import { Octokit, App } from 'octokit'
import { createNodeMiddleware } from '@octokit/webhooks'

dotenv.config()

const appId = process.env.APP_ID
const privateKey = process.env.PRIVATE_KEY
const secret = process.env.WEBHOOK_SECRET


const app = new App({
  appId,
  privateKey,
  webhooks: {
    secret
  },
})

const { data } = await app.octokit.request('/app')

app.octokit.log.debug(`Authenticated as '${data.name}'`)

app.webhooks.on('pull_request.opened', async ({ octokit, payload }) => {
  console.log(`Received a pull request event for #${payload.pull_request.number}`)
})

app.webhooks.onError((error) => {
  if (error.name === 'AggregateError') {
    console.log(`Error processing request: ${error.event}`)
  } else {
    console.log(error)
  }
})

const port = process.env.PORT || 3000
const path = '/api/webhook'
const localWebhookUrl = `http://localhost:${port}${path}`

const middleware = createNodeMiddleware(app.webhooks, { path })

http.createServer(middleware).listen(port, () => {
  console.log(`Server is listening for events at: ${localWebhookUrl}`)
  console.log('Press Ctrl + C to quit.')
})