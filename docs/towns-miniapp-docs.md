\# Changelog Source: https://docs.towns.com/build/bots/changelog

\# Events Source: https://docs.towns.com/build/bots/events

This guide covers what you need to know about events and how to handle
them in your bot. You\'ll learn about:

\* \[Event anatomy\](#event-anatomy) \* \[Event
listeners\](#event-listeners) \* \[Sending events\](#sending-events) \*
\[Permissions\](#permissions) \* \[Moderation\](#moderation) \*
\[Snapshot data\](#snapshot-data)

\## Event Anatomy

All events share a common \`BasePayload\` structure:

\* \`userId\`: The user who triggered the event. \* \`spaceId\`: The
space that the event occurred in. \*\*Note:\*\* This is \`null\` for
Direct Message (DM) channels, as these channels don\'t belong to a
space. \* \`channelId\`: The channel that the event occurred in. \*
\`eventId\`: The unique event ID. \* \`createdAt\`: The date and time
the event occurred. \* \`isDm\`: A flag indicating if the event occurred
in a DM channel.

Different event types extend this base with additional fields.

\<Note\> When handling events in DM channels, \`spaceId\` will be
\`null\`. Use the \`isDm\` flag to check if an event is from a DM
channel. \</Note\>

\## Message Forwarding Modes

Bots have three message forwarding modes that control which events they
receive. You configure this in your bot settings at
\[app.towns.com/developer\](https://app.towns.com/developer).

\### Available Modes

\*\*All Messages\*\*

\* Bot receives every event in channels it\'s in \* All event handlers
are available \* Use for: AI agents, moderation bots, analytics, or when
you need \`onTip\`, \`onChannelJoin\`, \`onChannelLeave\`, or
\`onEventRevoke\` handlers \* ⚠️ Warning: High volume in active channels

\*\*Mentions, Commands, Replies & Reactions\*\* (Default)

\* Bot receives: messages where it\'s mentioned, replies to its
messages, reactions, and slash commands \* Event handlers available:
\`onMessage\` (filtered), \`onSlashCommand\`, \`onReaction\`,
\`onMessageEdit\`, \`onRedaction\` \* Event handlers NOT available:
\`onTip\`, \`onChannelJoin\`, \`onChannelLeave\`, \`onEventRevoke\` \*
Use for: Most interactive bots that respond to direct user interaction

\*\*No Messages\*\*

\* Bot receives no message events \* Use for: External-only bots
triggered by \[custom webhooks\](/build/bots/external-interactions) or
timers

\## Event Listeners

All event listeners are asynchronous functions that receive a
\`handler\` and an \`event\` object.

The \`handler\` is the bot instance and the \`event\` contains the
\`BasePayload\` and additional fields specific to the event type.

\### onMessage

Fires when a message is sent in a channel the bot is in (subject to
forwarding settings).

\* \`message\`: The decrypted message text. \* \`replyId\`: The
\`eventId\` of the message being replied to (if reply). \* \`threadId\`:
The \`eventId\` of the thread\'s first message (if in thread). \*
\`mentions\`: List of users mentioned in the message. Each mention
contains the user\'s address and display name. \* \`isMentioned\`: True
if the bot was \@mentioned.

\### onSlashCommand

Fires when a user invokes one of your bot\'s slash commands. For more
information about slash commands, see the \[Slash Commands
guide\](/build/bots/slash-commands).

\* \`command\`: The name of the command invoked by the user. \*
\`args\`: The arguments passed to the command. \* \`mentions\`: List of
users mentioned in the command. \* \`replyId\`: The message being
replied to (if any). \* \`threadId\`: The thread context (if any).

\### onReaction

\<Warning\> You only get the \`reaction\` and \`messageId\` - not the
message content! Store messages externally if you need context.
\</Warning\>

\* \`reaction\`: The reaction emoji. \* \`messageId\`: The \`eventId\`
of the message being reacted to.

\### onMessageEdit

Fires when a message is edited.

\* \`message\`: The new message content. \* \`refEventId\`: The
\`eventId\` of the message being edited. \* \`replyId\`: If the edited
message was a reply. \* \`threadId\`: If the edited message was in a
thread. \* \`mentions\`: Array of mentioned users in the edited message.
\* \`isMentioned\`: True if the bot is mentioned in the edited message.

\### onRedaction

Fires when a message is deleted by a user.

\* \`refEventId\`: The \`eventId\` of the message being deleted.

\### onEventRevoke

Fires when a message is revoked, either by the user that sent it or by
an admin with the \`Redact\` permission.

\<Note\> This event handler only works in \"All Messages\" mode. See
\[Message Forwarding Modes\](#message-forwarding-modes). \</Note\>

\* \`refEventId\`: The \`eventId\` of the message being revoked.

\### onTip

Fires when a user sends a cryptocurrency tip on a message.

\<Note\> This event handler only works in \"All Messages\" mode. See
\[Message Forwarding Modes\](#message-forwarding-modes). \</Note\>

\* \`messageId\`: The \`eventId\` of the message that received the tip.
\* \`senderAddress\`: The address of the user who sent the tip. \*
\`receiverAddress\`: The address of the user who received the tip. \*
\`amount\`: The amount of the tip. \* \`currency\`: The currency of the
tip.

It can fire for any tip, not just tips to the bot.

\### onChannelJoin

Fires when users join a channel.

\<Note\> This event handler only works in \"All Messages\" mode. See
\[Message Forwarding Modes\](#message-forwarding-modes). \</Note\>

\* \`userId\`: The user who joined or left the channel. \*
\`channelId\`: The channel that the user joined or left.

\### onChannelLeave

Fires when users leave a channel.

\<Note\> This event handler only works in \"All Messages\" mode. See
\[Message Forwarding Modes\](#message-forwarding-modes). \</Note\>

\* \`userId\`: The user who left the channel. \* \`channelId\`: The
channel that the user left.

\## Sending events

You can use bot actions to send events to Towns Network.

\### sendMessage

Send a message to a channel.

\`\`\`ts theme={null} const { eventId } = await
bot.sendMessage(channelId, message, opts) \`\`\`

\* \`channelId\`: The channel to send the message to. \* \`message\`:
The message to send. \* \`opts\`: The options for the message. \*
\`threadId\`: The thread to send the message to. \* \`replyId\`: The
message to reply to. \* \`mentions\`: The users to mention in the
message. Accepts a list of \`userId\` and \`displayName\`. \*
\`attachments\`: The attachments to send with the message. \*
\`ephemeral\`: Whether the message should be ephemeral (wont be stored
in the channel history)

Returns the \`eventId\` of the sent message.

\#### Sending attachments

The bot framework supports four types of attachments with automatic
validation and encryption.

\##### Image Attachments from URLs

Send images by URL with automatic validation and dimension detection:

\`\`\`ts theme={null} await bot.sendMessage(channelId, message, {
attachments: \[ { type: \'image\', url:
\'https://example.com/image.png\', alt: \'Example image\' } \] }) \`\`\`

\##### Miniapp Attachments

You can use it to send a miniapp. It will be rendered in the message as
a miniapp.

\`\`\`ts theme={null} await bot.sendMessage(channelId, \"Check this
out!\", { attachments: \[{ type: \'miniapp\', url:
\'https://example.com/miniapp\' }\] }) \`\`\`

\##### Link Attachments

You can use it to send any link.

\`\`\`ts theme={null} await bot.sendMessage(channelId, \"Check this
out!\", { attachments: \[{ type: \'link\', url:
\'https://docs.towns.com\' }\] }) \`\`\`

\##### Chunked Media Attachments

Send binary data (videos, screenshots, generated images). Framework
automatically encrypts and chunks (1.2MB per chunk).

\*\*Video:\*\*

\`\`\`ts theme={null} import { readFileSync } from \'node:fs\'

bot.onSlashCommand(\"video\", async (handler, { channelId }) =\> { const
videoData = readFileSync(\'./video.mp4\')

await handler.sendMessage(channelId, \"Check this out!\", { attachments:
\[{ type: \'chunked\', data: videoData, // Uint8Array filename:
\'video.mp4\', mimetype: \'video/mp4\', // Required for Uint8Array
width: 1920, // Optional height: 1080 }\] }) }) \`\`\`

\*\*Canvas:\*\*

\`\`\`ts theme={null} import { createCanvas } from \'@napi-rs/canvas\'

bot.onSlashCommand(\"chart\", async (handler, { channelId, args }) =\> {
const value = parseInt(args\[0\]) \|\| 50

const canvas = createCanvas(400, 300) const ctx =
canvas.getContext(\'2d\') ctx.fillStyle = \'#2c3e50\' ctx.fillRect(0, 0,
400, 300) ctx.fillStyle = \'#3498db\' ctx.fillRect(50, 300 - value \* 2,
300, value \* 2)

const blob = await canvas.encode(\'png\')

await handler.sendMessage(channelId, \"Your chart:\", { attachments: \[{
type: \'chunked\', data: blob, // Blob (mimetype automatic) filename:
\'chart.png\' }\] }) }) \`\`\`

\*\*Screenshot:\*\*

\`\`\`ts theme={null} bot.onSlashCommand(\"screenshot\", async (handler,
{ channelId }) =\> { const screenshotBuffer = await captureScreen()

await handler.sendMessage(channelId, \"Screenshot:\", { attachments: \[{
type: \'chunked\', data: screenshotBuffer, // Uint8Array filename:
\'screen.png\', mimetype: \'image/png\' // Required for Uint8Array }\]
}) }) \`\`\`

\<Note\> \* Uint8Array requires \`mimetype\` parameter \* Blob has
automatic mimetype \* Image dimensions auto-detected for \`image/\*\`
mimetypes \</Note\>

\### sendReaction

Send a reaction to a message.

\`\`\`ts theme={null} await bot.sendReaction(channelId, eventId,
reaction) \`\`\`

\* \`channelId\`: The channel to send the reaction to. \* \`eventId\`:
The \`eventId\` of the message to react to. \* \`reaction\`: The
reaction to send.

Returns the \`eventId\` of the sent reaction.

Example:

\`\`\`ts theme={null} bot.onMessage(async (handler, { channelId,
eventId, message }) =\> { if (message.includes(\'Towns\')) { await
handler.sendReaction(channelId, eventId, \'🔥\') } }) \`\`\`

\### editMessage

Edit a message.

\`\`\`ts theme={null} const { eventId } = await
bot.editMessage(channelId, eventId, message, opts) \`\`\`

\* \`channelId\`: The channel to edit the message in. \* \`eventId\`:
The \`eventId\` of the message to edit. \* \`message\`: The new message
content. \* \`opts?\`: Optional options for the edit. \* \`threadId\`:
Change the thread of the message. \* \`replyId\`: Change the reply of
the message. \* \`mentions\`: Change the mentions of the message.
Accepts a list of \`userId\` and \`displayName\`. \* \`attachments\`:
Change the attachments of the message.

Returns the \`eventId\` of the edited message.

\### removeEvent

Remove any event that was sent by the bot.

\`\`\`ts theme={null} await bot.removeEvent(channelId, eventId) \`\`\`

\* \`channelId\`: The channel to remove the event from. \* \`eventId\`:
The \`eventId\` of the event to remove.

Returns the \`eventId\` of the removed event.

\### adminRemoveEvent

Remove any event from a channel. Requires the \`Redact\` permission.

\`\`\`ts theme={null} await bot.adminRemoveEvent(channelId, eventId)
\`\`\`

\* \`channelId\`: The channel to remove the event from. \* \`eventId\`:
The \`eventId\` of the event to remove.

Returns the \`eventId\` of the redaction event.

\### sendTip

Send a cryptocurrency tip to a user on a message.

\<Note\> Your \*\*gas wallet\*\* needs Base ETH to pay for gas fees, and
your \*\*bot treasury wallet\*\* needs to hold the ETH that will be sent
as tips. See \[Understanding Your Bot\'s Wallet
Architecture\](/build/bots/getting-started#understanding-your-bots-wallet-architecture)
for details. \</Note\>

\`\`\`ts theme={null} import { parseEther } from \'viem\'

await bot.sendTip({ userId, messageId, channelId, amount:
parseEther(\'0.001\') }) \`\`\`

\* \`userId\`: The user to tip \* \`messageId\`: The \`eventId\` of the
message to tip \* \`channelId\`: The channel containing the message \*
\`amount\`: The tip amount in wei

Returns the \`eventId\` of the tip event.

Example - tip users for helpful messages:

\`\`\`ts theme={null} bot.onMessage(async (handler, { channelId,
eventId, userId, message }) =\> { const shouldTip =
checkIfDeserveTip(message) if (shouldTip) { await handler.sendTip({
userId, amount: parseEther(\'0.001\'), messageId: eventId, channelId })
} }) \`\`\`

\## Permissions

Check user permissions before executing operations.

\### hasAdminPermission

Check if user is a space admin (has \`ModifyBanning\` permission).

\`\`\`ts theme={null} const isAdmin = await
handler.hasAdminPermission(userId, spaceId) \`\`\`

\### checkPermission

Check specific permission for a user.

\`\`\`ts theme={null} import { Permission } from
\'@towns-protocol/web3\'

const canRedact = await handler.checkPermission( channelId, userId,
Permission.Redact ) \`\`\`

\*\*Available permissions:\*\*

\* \`Permission.Read\` \* \`Permission.Write\` \* \`Permission.Redact\`
\* \`Permission.ModifyBanning\` \* \`Permission.PinMessage\` \*
\`Permission.AddRemoveChannels\` \* \`Permission.ModifySpaceSettings\`

\*\*Example:\*\*

\`\`\`ts theme={null} bot.onSlashCommand(\'ban\', async (handler, event)
=\> { // Check if user has admin permission if (!await
handler.hasAdminPermission(event.userId, event.spaceId)) { await
handler.sendMessage(event.channelId, \'No permission\') return }

const userToBan = event.mentions\[0\]?.userId if (userToBan) { try {
await handler.ban(userToBan, event.spaceId) await
handler.sendMessage(event.channelId, \'User banned\') } catch (error) {
await handler.sendMessage(event.channelId, \'Failed to ban user\') } }
}) \`\`\`

\## Moderation

Ban and unban users.

\<Warning\> Your \*\*bot\*\* must have \`ModifyBanning\` permission in
the space. Your \*\*gas wallet\*\* needs Base ETH to pay for gas fees.
\</Warning\>

\### ban

\`\`\`ts theme={null} await handler.ban(userId, spaceId) \`\`\`

\### unban

\`\`\`ts theme={null} await handler.unban(userId, spaceId) \`\`\`

\## Snapshot Data

Bots have access to snapshot data for reading channel settings and
membership information.

\<Warning\> Snapshot data may not reflect the latest state. It\'s cached
and updated periodically. \</Warning\>

\### getChannelInception

Get channel settings and inception data.

\`\`\`ts theme={null} const channelData = await
bot.snapshot.getChannelInception(streamId) \`\`\`

\### getUserMemberships

Get a user\'s space memberships.

\`\`\`ts theme={null} const memberships = await
bot.snapshot.getUserMemberships(userId) \`\`\`

\### getSpaceMemberships

Get all members of a space.

\`\`\`ts theme={null} const members = await
bot.snapshot.getSpaceMemberships(spaceId) \`\`\`

\# External Integrations Source:
https://docs.towns.com/build/bots/external-interactions

Towns bots are built on \[Hono\](https://hono.dev). While \`/webhook\`
is reserved for Towns events, you can add custom routes for external
webhooks, APIs, and scheduled tasks.

\## Using Bot Methods Anywhere

Bot methods like \`sendMessage()\` can be called directly on the bot
instance, outside of event handlers. This enables integration with
external services.

\`\`\`ts theme={null} import { Hono } from \'hono\' import {
makeTownsBot } from \'@towns-protocol/bot\'

const bot = await makeTownsBot(privateData, jwtSecret) const {
jwtMiddleware, handler } = bot.start()

const app = new Hono()

// Towns webhook (required) app.post(\'/webhook\', jwtMiddleware,
handler)

// Custom API endpoint app.post(\'/api/send\', async (c) =\> { const {
channelId, message } = await c.req.json() await
bot.sendMessage(channelId, message) return c.json({ ok: true }) })

export default app \`\`\`

\## External Webhooks

Integrate with external services like GitHub, Linear, Stripe, or custom
APIs.

\`\`\`ts theme={null} import { Hono } from \'hono\' import {
makeTownsBot } from \'@towns-protocol/bot\'

const bot = await makeTownsBot(privateData, jwtSecret, { commands })

let notificationChannelId: string \| null = null

// Configure channel for notifications bot.onSlashCommand(\'setup\',
async (handler, event) =\> { notificationChannelId = event.channelId
await handler.sendMessage(event.channelId, \'Notifications configured\')
})

const { jwtMiddleware, handler } = bot.start() const app = new Hono()

app.post(\'/webhook\', jwtMiddleware, handler)

// External webhook endpoint app.post(\'/external-webhook\', async (c)
=\> { const payload = await c.req.json()

if (!notificationChannelId) { return c.json({ error: \'No channel
configured\' }, 400) }

// Send events to Towns channel await bot.sendMessage(
notificationChannelId, \`Event received: \${payload.type}\` )

return c.json({ success: true }) })

export default app \`\`\`

You can use this pattern with any service that has webhook integration.
Alchemy, GitHub, Linear, etc.

\## Scheduled Tasks

Use intervals or cron jobs to send periodic updates.

\`\`\`ts theme={null} const bot = await makeTownsBot(privateData,
jwtSecret) const channels = new Set()

bot.onSlashCommand(\'alerts\', async (handler, event) =\> {
channels.add(event.channelId) await handler.sendMessage(event.channelId,
\'Alerts enabled\') })

// Run every 5 minutes setInterval(async () =\> { const data = await
fetch(\'https://api.example.com/data\').then(r =\> r.json())

for (const channelId of channels) { await bot.sendMessage(channelId,
\`Update: \${data.value}\`) } }, 5 \* 60 \* 1000) \`\`\`

\## Persistent Storage

\<Warning\> In-memory storage (Map, Set) only works on always-on
servers. Use a database for production. \</Warning\>

Popular options:

\* \*\*SQLite/Turso\*\* - Simple, serverless-compatible \*
\*\*Redis\*\* - Fast caching and rate limiting \* \*\*PostgreSQL\*\* -
Full-featured relational database \* \*\*Supabase\*\* - Managed
PostgreSQL with APIs

\## Next Steps

\* Explore \[onchain integrations\](/build/bots/onchain-integrations) \*
Learn about \[slash commands\](/build/bots/slash-commands) \* Read about
\[event handlers\](/build/bots/events)

\# Getting Started Source:
https://docs.towns.com/build/bots/getting-started

This guide will walk you through creating, developing, and deploying
your first Towns bot. You\'ll learn how to:

1\. \[Create a bot in Towns\](#create-a-bot) 2. \[Set up your
development environment\](#develop-your-bot) 3. \[Deploy to
Render.com\](#deploy-your-bot) 4. \[Configure your bot in
Towns\](#configure-in-towns)

\## Prerequisites

Before you begin, make sure you have:

\* \[Node.js v20+\](https://nodejs.org/en/download) installed (download
for your OS) \* \[Bun\](https://bun.sh/docs/installation) installed
(download for your OS) \* A \[GitHub
account\](https://github.com/signup) with SSH key configured (for
pushing your bot code) \* \[Create SSH
key\](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
\* \[Upload SSH key to
GitHub\](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)

\## Create a Bot

1\. \*\*Visit the Developer Portal\*\*

Go to \[app.towns.com/developer\](https://app.towns.com/developer)

2\. \*\*Create New Bot\*\*

Fill in the details and click \"Create Bot\".

3\. \*\*Save Your Credentials\*\*

After creation, you\'ll receive two critical values:

\* \`APP_PRIVATE_DATA\` - Your bot\'s private key and encryption device
(base64 encoded string) \* \`JWT_SECRET\` - Used to verify webhook
requests from Towns servers

\<Note\> Store these securely - you\'ll need them for deployment.
\</Note\>

After following the steps above, you should be redirected to the bot
settings page.

Follow the instructions below to deploy your bot and set your webhook
url.

\## Develop Your Bot

Now let\'s set up your bot development environment.

\### Initialize Your Project

Create a new bot project using the Towns bot CLI:

\`\`\`bash theme={null} bunx towns-bot init my-bot \`\`\`

This creates a new directory with a basic bot template.

\### Install Dependencies

\`\`\`bash theme={null} cd my-bot bun install \`\`\`

\### Add Bot Discovery Endpoint

Open \`src/index.ts\` and add this route after the \`/webhook\` route:

\`\`\`ts theme={null} // After your /webhook route
app.get(\'/.well-known/agent-metadata.json\', async (c) =\> { return
c.json(await bot.getIdentityMetadata()) }) \`\`\`

This endpoint is \*\*required\*\* for bot directories to discover and
index your bot. After deploying your bot, go to the \[developer
dashboard\](https://app.towns.com/developer/dashboard) and click the
\*\*Boost\*\* button to submit your bot for indexing.

\### Configure Environment

Copy the \`.env.sample\` file in your project root:

\`\`\`bash theme={null} cp .env.sample .env \`\`\`

\### Push to GitHub

Create a \[new repository on GitHub\](https://github.com/new), follow
their instructions, commit all your changes and push your bot code to
it.

\## Deploy Your Bot

We\'ll deploy to Render.com, which offers a generous free tier perfect
for bot hosting.

1\. \*\*Sign up for Render\*\*

Go to \[render.com\](https://render.com) and create an account (can use
GitHub login)

2\. \*\*Create New Web Service\*\*

\* Click \"New +\" → \"Web Service\" \* Connect your GitHub account if
prompted \* Select your bot repository

3\. \*\*Configure the Service\*\*

Fill in the deployment settings:

\| Setting \| Value \| \| \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \| \|
\*\*Name\*\* \| \`my-bot\` (or any name you prefer) \| \|
\*\*Language\*\* \| \`Node\` \| \| \*\*Build Command\*\* \| \`bun
install\` \| \| \*\*Start Command\*\* \| \`bun run start\` \|

4\. \*\*Add Environment Variables\*\*

In the \"Environment\" section, you can either paste your \`.env\` file
contents or add each variable manually.

\| Key \| Value \| \| \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| \`APP_PRIVATE_DATA\` \| Your app private data from bot creation \|
\| \`JWT_SECRET\` \| Your JWT secret from bot creation \| \| \`PORT\` \|
\`5123\` \|

5\. \*\*Deploy\*\*

Click \"Create Web Service\". Render will:

\* Clone your repository \* Run \`bun install\` to build your bot \*
Start your bot with \`bun run start\`

Wait for the deploy to finish. You\'ll get a URL like:

\`\`\` https://my-bot.onrender.com \`\`\`

\<Note\> Free tier services on Render may spin down after 15 minutes of
inactivity. The first request after spin-down may take 30-60 seconds.
Consider upgrading to a paid plan for production bots. \</Note\>

\## Configure in Towns

Now that your bot is deployed and publicly accessible, connect it to
Towns.

\### Set Webhook URL

1\. Go back to
\[app.towns.com/developer\](https://app.towns.com/developer)

2\. Click on your bot

3\. Under \"Webhook URL\", enter: \`\`\`
https://my-bot.onrender.com/webhook \`\`\` \<Warning\> Don\'t forget the
\`/webhook\` path at the end! \</Warning\>

4\. Click \"Save\"

\### Configure Forwarding Settings

In the bot settings page, under \"Forwarding Settings\", choose which
messages your bot receives.

\* \*\*All Messages\*\* - Bot receives every event in channels it\'s in
\* All event handlers available. See \[Events\](/build/bots/events) for
more information. \* Use for: AI agents, moderation bots, analytics, or
when you need tip/membership events

\* \*\*Mentions, Commands, Replies & Reactions\*\* (Default) - Bot only
receives: \* Direct \@mentions, replies to bot\'s messages, reactions,
and slash commands \* Available handlers: \`onMessage\` (filtered),
\`onSlashCommand\`, \`onReaction\`, \`onMessageEdit\`, \`onRedaction\`
\* NOT available: \`onTip\`, \`onChannelJoin\`, \`onChannelLeave\`,
\`onEventRevoke\` \* Use for: Most interactive bots

\* \*\*No Messages\*\* - Bot receives no message events \* Use for:
External-only bots (e.g., GitHub webhooks, scheduled tasks)

Click \"Save\" after selecting your preference.

\### Install Bot to a Space

Finally, install your bot to a space to start using it:

1\. In Towns app, go to a space you own or admin 2. Go to Space Settings
→ Bots 3. Search for your bot by username 4. Click \"Install\" 5. Grant
permissions as needed

Your bot is now live! 🎉

\## Understanding Your Bot\'s Wallet Architecture

Your bot has two wallets that work together:

\### Bot Treasury Wallet

The \*\*Bot Treasury Wallet\*\* (\`bot.appAddress\`) is a SimpleAccount
(ERC-4337) smart contract that holds your bot\'s funds:

\* \*\*Receives funds\*\*: All tips and payments sent to your bot are
stored here \* \*\*Stores assets\*\*: This is where ETH and tokens are
held \* \*\*Source for payments\*\*: When your bot sends tips to users,
funds come from this wallet

To fund your bot treasury, send Base ETH directly to \`bot.appAddress\`
from any wallet.

\### Gas Wallet

The \*\*Gas Wallet\*\* (\`bot.viem.account\`) pays for gas fees on bot
transactions:

\* \*\*Signs transactions\*\*: Authorizes all operations on behalf of
the bot treasury \* \*\*Pays gas fees\*\*: Needs Base ETH to cover
transaction costs \* \*\*Fund this wallet\*\*: Required for any
blockchain transactions

\<Warning\> Your gas wallet MUST be funded with Base ETH to execute any
blockchain transactions (sending tips, banning users, etc.). Without
gas, your bot cannot perform onchain operations. \</Warning\>

\### When to Fund Each

\*\*Fund your Gas Wallet when:\*\*

\* Your bot needs to send tips to users \* Your bot performs moderation
actions (ban/unban) \* Your bot interacts with smart contracts \* You
see \"insufficient funds for gas\" errors

\*\*Fund your Bot Treasury when:\*\*

\* Your bot needs to send tips from its treasury \* You want to receive
payments and tips \* Your bot needs to hold ETH/tokens for operations

\<Note\> The gas wallet credentials are provided in \`APP_PRIVATE_DATA\`
during bot creation. You can extract the wallet address from this value
to fund it. \</Note\>

\## Testing Your Bot

Try these to verify everything works:

In the channel you installed your bot to, mention your bot:

\`\`\` \@mybot hello \`\`\`

The bot should respond with \"Hello there! 👋\"

\## Next Steps

Now that your bot is running, explore more capabilities:

\* \[Local development\](/build/bots/local-development) - Learn how to
develop bots locally to fast iterate \* \[Learn about event
handlers\](/build/bots/events) - Handle different event types \* \[Add
slash commands\](/build/bots/slash-commands) - Create custom \`/help\`,
\`/poll\`, etc. \* \[External
interactions\](/build/bots/external-interactions) - Timers, webhooks,
custom APIs

\# Interactions Source: https://docs.towns.com/build/bots/interactions

Interactions let users interact with your bot through forms, buttons,
text inputs, transaction requests, and signature requests.

\## Sending Interactions

Use \`handler.sendInteractionRequest()\` to send interactive UI elements
to users. The method takes a channel ID and a payload object that
defines the interaction type.

\`\`\`ts theme={null} await handler.sendInteractionRequest(channelId,
payload) \`\`\`

\### Forms (Buttons & Text Inputs)

Forms display buttons and text inputs that users can interact with. Use
forms for menus, confirmations, polls, feedback collection, and
multi-step flows. Set \`recipient\` to target a specific user, or omit
it for public interactions anyone can respond to.

\`\`\`ts theme={null} await
handler.sendInteractionRequest(event.channelId, { type: \'form\', id:
\'my-form\', components: \[ { id: \'name\', type: \'textInput\',
placeholder: \'Enter name\...\' }, { id: \'confirm\', type: \'button\',
label: \'Submit\' }, { id: \'cancel\', type: \'button\', label:
\'Cancel\' } \], recipient: event.userId // Optional: omit for public
interactions }) \`\`\`

\*\*Component Types:\*\*

\| Type \| Properties \| \| \-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| \`button\` \| \`id\`, \`type: \'button\'\`, \`label\` \| \|
\`textInput\` \| \`id\`, \`type: \'textInput\'\`, \`placeholder\` \|

\### Transaction Requests

Prompt users to sign and execute blockchain transactions from their
wallets. Use transactions for payments, token transfers, NFT minting,
contract interactions, and DeFi operations. Set \`tx.signerWallet\` to
require a specific wallet, or omit it to let users choose.

\`\`\`ts theme={null} import { encodeFunctionData, erc20Abi, parseUnits
} from \'viem\'

await handler.sendInteractionRequest(event.channelId, { type:
\'transaction\', id: \'token-transfer\', title: \'Send Tokens\',
subtitle: \'Transfer 50 USDC\', tx: { chainId: \'8453\', to:
\'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913\', value: \'0\', data:
encodeFunctionData({ abi: erc20Abi, functionName: \'transfer\', args:
\[recipientAddress, parseUnits(\'50\', 6)\] }), signerWallet:
smartAccountAddress // Optional: omit to let user choose wallet },
recipient: event.userId }) \`\`\`

\### Signature Requests

Request cryptographic signatures without executing transactions. Use
signatures for authentication, permissions, off-chain agreements, and
gasless interactions. Supports EIP-712 typed data (\`\'typed_data\'\`)
and personal sign (\`\'personal_sign\'\`).

\`\`\`ts theme={null} await
handler.sendInteractionRequest(event.channelId, { type: \'signature\',
id: \'agreement\', title: \'Sign Agreement\', subtitle: \'I agree to the
terms\', chainId: \'8453\', data: JSON.stringify({ domain: { name: \'My
Bot\', version: \'1\', chainId: 8453, verifyingContract:
\'0x0000000000000000000000000000000000000000\' }, types: { Message: \[{
name: \'content\', type: \'string\' }\] }, primaryType: \'Message\',
message: { content: \'I agree to the terms\' } }), method:
\'typed_data\', signerWallet: event.userId, recipient: event.userId })
\`\`\`

\## Handling Responses

Use \`bot.onInteractionResponse()\` to handle user interactions. This
callback fires whenever a user clicks a button, submits a form,
completes a transaction, or signs a message.

\*\*Available properties:\*\*

\* \`event.userId\` - The user who responded \* \`event.channelId\` -
Channel where interaction occurred \*
\`event.response.payload.content?.case\` - Type: \`\'form\'\`,
\`\'transaction\'\`, or \`\'signature\'\` \*
\`event.response.payload.content?.value\` - Response data

\`\`\`ts theme={null} bot.onInteractionResponse(async (handler, event)
=\> { const { response } = event

switch (response.payload.content?.case) { case \'form\': { const form =
response.payload.content.value for (const component of form.components)
{ if (component.component.case === \'button\') { // Button clicked:
component.id } if (component.component.case === \'textInput\') { const
value = component.component.value.value // Text input: component.id =
value } } break }

case \'transaction\': { const tx = response.payload.content.value if
(tx.txHash) { await handler.sendMessage(event.channelId, \`Success:
\${tx.txHash}\`) } else if (tx.error) { await
handler.sendMessage(event.channelId, \`Failed: \${tx.error}\`) } break }

case \'signature\': { const sig = response.payload.content.value if
(sig.signature) { await handler.sendMessage(event.channelId, \'Signed
successfully\') } else if (sig.error) { await
handler.sendMessage(event.channelId, \`Failed: \${sig.error}\`) } break
} } }) \`\`\`

\## Complete Example: Poll

\`\`\`ts theme={null} const polls = new Map\<string, { yes: number; no:
number; voters: Set\<string\> }\>()

bot.onSlashCommand(\'poll\', async (handler, event) =\> { const pollId =
\`poll-\${Date.now()}\` polls.set(pollId, { yes: 0, no: 0, voters: new
Set() })

await handler.sendInteractionRequest(event.channelId, { type: \'form\',
id: pollId, components: \[ { id: \'yes\', type: \'button\', label:
\'Yes\' }, { id: \'no\', type: \'button\', label: \'No\' } \] // No
recipient = public poll }) })

bot.onInteractionResponse(async (handler, event) =\> { if
(event.response.payload.content?.case !== \'form\') return

const form = event.response.payload.content.value const poll =
polls.get(form.id) if (!poll) return

// Prevent duplicate votes if (poll.voters.has(event.userId)) return
poll.voters.add(event.userId)

for (const c of form.components) { if (c.component.case === \'button\')
{ if (c.id === \'yes\') poll.yes++ if (c.id === \'no\') poll.no++ } }

await handler.sendMessage(event.channelId, \`Yes: \${poll.yes}, No:
\${poll.no}\`) }) \`\`\`

\## Reference

\### Form Request

\| Field \| Type \| Required \| Description \| \|
\-\-\-\-\-\-\-\-\-\-\-- \| \-\-\-\-\-\-\-- \| \-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| \`type\` \| \`\'form\'\` \| Yes \| Interaction type \| \| \`id\`
\| string \| Yes \| Unique ID for matching responses \| \|
\`components\` \| array \| Yes \| Buttons and text inputs \| \|
\`recipient\` \| string \| No \| Target user address (omit for public)
\|

\### Transaction Request

\| Field \| Type \| Required \| Description \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \| \-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| \`type\` \| \`\'transaction\'\` \| Yes \| Interaction type \| \|
\`id\` \| string \| Yes \| Unique ID for matching responses \| \|
\`title\` \| string \| Yes \| Heading shown to user \| \| \`subtitle\`
\| string \| Yes \| Description of transaction \| \| \`tx.chainId\` \|
string \| Yes \| Chain ID (e.g., \`\'8453\'\` for Base) \| \| \`tx.to\`
\| string \| Yes \| Contract or recipient address \| \| \`tx.value\` \|
string \| Yes \| ETH amount in wei \| \| \`tx.data\` \| string \| Yes \|
Encoded function call \| \| \`tx.signerWallet\` \| string \| No \|
Required wallet (omit for user choice) \| \| \`recipient\` \| string \|
No \| Target user address \|

\### Signature Request

\| Field \| Type \| Required \| Description \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-- \| \-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\| \`type\` \| \`\'signature\'\` \| Yes \| Interaction type \| \| \`id\`
\| string \| Yes \| Unique ID for matching responses \| \| \`chainId\`
\| string \| Yes \| Chain ID \| \| \`data\` \| string \| Yes \| JSON
stringified EIP-712 typed data \| \| \`method\` \| string \| Yes \|
\`\'typed_data\'\` or \`\'personal_sign\'\` \| \| \`signerWallet\` \|
string \| Yes \| Wallet address to sign \| \| \`title\` \| string \| No
\| Heading shown to user \| \| \`subtitle\` \| string \| No \|
Description \| \| \`recipient\` \| string \| No \| Target user address
\|

\## Next Steps

\* Learn about \[onchain
integrations\](/build/bots/onchain-integrations) for bot blockchain
operations \* Explore \[slash commands\](/build/bots/slash-commands) \*
Read about \[event handlers\](/build/bots/events)

\# Introduction Source: https://docs.towns.com/build/bots/introduction

Bots in Towns Protocol are programmable applications that can interact
with spaces, channels, and users through end-to-end encrypted messaging.

They enable automation, integrations, and enhanced user experiences
within Towns communities.

\## Architecture

Towns bots consist of two interconnected pieces:

\### Onchain Component

Bots are smart contracts registered through the \*\*App Registry\*\* on
Base and installed in a \`Space\`.

The onchain component provides:

\* \*\*Secure identity\*\*: Each bot has a unique address and public key
\* \*\*Fine-grained permissions\*\*: Control exactly what the bot can do
(read/write messages, ban users, moderate, etc.) \* \*\*Recurring
revenue\*\*: Bots can be paid monthly or yearly by spaces that install
them \* \*\*ERC-4337 Account Abstraction\*\*: Bots use SimpleAccount
contracts enabling advanced onchain interactions \* \*\*Batch execution
support\*\*: Execute multiple contract calls atomically using ERC-7821

This allows bots to:

\* Have their own app contract (treasury) for receiving and storing
ETH/tokens \* Have a separate wallet for signing transactions and paying
gas fees \* Interact with any smart contract (DeFi, NFTs, DAOs, etc.) \*
Execute complex multi-step transactions in one atomic operation \*
Receive payments and tips onchain

\### Server Component

The server component is a webhook endpoint that receives events from
Towns Protocol nodes and processes them.

A bot operates like a specialized user in the Towns Protocol network. It
can:

\* \*\*Send and receive messages\*\* with full end-to-end encryption \*
\*\*React to events\*\* in real-time (messages, tips, joins, leaves) \*
\*\*Execute slash commands\*\* with custom logic \* \*\*Moderate
channels\*\* (ban/unban users with proper permissions) \* \*\*Check
permissions\*\* before executing sensitive operations \* \*\*Receive
tips\*\* just like regular users

All of this with the same security guarantees as a user: \*\*end-to-end
encryption\*\* for all messages.

Additionally, the server can communicate with the onchain component,
allowing it to:

\* Read from any smart contract \* Interact with any smart contract
using ERC-7821 batch execution \* Execute complex DeFi operations
(swaps, staking, liquidity provision) \* Mint NFTs, manage DAOs, and
interact with any Web3 protocol

Your bot has two wallets:

\* \*\*Bot Treasury Wallet\*\* (\`bot.appAddress\`) - Holds funds and
receives tips \* \*\*Gas Wallet\*\* (\`bot.viem.account\`) - Signs
transactions and pays for gas

Learn more in the \[Getting Started
guide\](/build/bots/getting-started#understanding-your-bots-wallet-architecture).

\## Use Cases

With these capabilities, you can build bots that:

\### Communication & Engagement

\* AI assistants that answer questions using LLMs \* Welcome bots that
greet new members \* Announcement bots for important updates \* Poll and
voting systems

\### Moderation & Safety

\* Auto-moderation based on rules \* Spam detection and prevention \*
Content filtering \* User verification systems

\### Onchain Integration

\* Tip tracking and leaderboards \* Token price monitoring and alerts \*
NFT minting and distribution \* DeFi operations (swaps, staking, yield
farming) \* DAO proposal notifications and voting

\### External Services

\* GitHub integration for code updates \* Calendar and meeting reminders
\* Weather and news updates \* Custom webhooks from any service

\## Next Steps

Ready to build your first bot? Continue to the \[Getting Started
guide\](/build/bots/getting-started) to create and deploy your bot in
minutes.

\# Local Development Source:
https://docs.towns.com/build/bots/local-development

Testing your bot locally before deploying to production lets you iterate
quickly, see logs in real-time, and debug issues efficiently. This guide
will teach you how to set up a local development environment with ngrok.

\## Prerequisites

Before you begin, make sure you have:

\* A bot created in the \[Developer
Portal\](https://app.towns.com/developer) \* Your bot project set up
locally with dependencies installed \* Your \`.env\` file configured
with \`APP_PRIVATE_DATA\` and \`JWT_SECRET\`

\## Using ngrok for Local Testing

ngrok creates a secure tunnel from a public URL to your local
development server, allowing Towns to send webhook events to your bot
running on \`localhost\`.

\### 1. Start Your Bot Locally

Run your bot in development mode:

\`\`\`bash theme={null} bun run dev \`\`\`

Your bot will start on \`http://localhost:5123\` (or the port specified
in your \`.env\` file).

\### 2. Install and Start ngrok

Follow the \[ngrok installation guide\](https://ngrok.com/download) to
install ngrok for your platform.

Once installed, start ngrok to forward port 5123 (or the port specified
in your \`.env\` file):

\`\`\`bash theme={null} ngrok http 5123 \`\`\`

You\'ll see output like this:

\`\`\` Forwarding https://abc123.ngrok-free.app -\>
http://localhost:5123 \`\`\`

Copy the HTTPS URL (e.g., \`https://abc123.ngrok-free.app\`). This is
your public-facing URL that Towns will use to send events to your bot.

\<Note\> The free tier of ngrok provides a random URL each time you
restart. You can use a paid plan to get a consistent URL. \</Note\>

\### 3. Configure Webhook URL

Update your bot\'s webhook URL to point to your ngrok tunnel:

1\. Go to \[app.towns.com/developer\](https://app.towns.com/developer)
2. Click on your bot 3. Under \"Webhook URL\", enter your ngrok URL with
the \`/webhook\` path: \`\`\` https://abc123.ngrok-free.app/webhook
\`\`\` 4. Click \"Save\"

\### 4. Test Your Bot

Now you\'re ready to test! Install your bot in a test space and interact
with it:

1\. In the Towns app, go to a space you own or admin 2. Go to Space
Settings → Bots 3. Search for your bot and install it 4. Try sending
messages, mentioning the bot, or using slash commands

You\'ll see webhook events arrive in your local terminal in real-time,
along with any console logs you\'ve added for debugging.

\## Debugging

By default, your bot template includes request logging. You\'ll see each
incoming webhook event in your console:

\`\`\`bash theme={null} \[2025-10-28 10:30:45\] POST /webhook 200 - 45ms
\`\`\`

You can also use \`DEBUG=csb:bot bun run dev\` to see more detailed logs
about events in your local terminal.

\## Switching Back to Production

When you\'re ready to deploy, remember to:

1\. Push your changes to GitHub 2. Deploy to your production hosting
(e.g., Render) 3. Update your bot\'s webhook URL back to your production
URL: \`\`\` https://your-bot.onrender.com/webhook \`\`\`

\<Warning\> Don\'t forget to switch the webhook URL! Leaving it pointed
at ngrok will break your bot once you close the ngrok tunnel.
\</Warning\>

\## Next Steps

\* \[Learn about event handlers\](/build/bots/events) - Handle different
event types \* \[Add slash commands\](/build/bots/slash-commands) -
Create custom \`/help\`, \`/poll\`, etc. \* \[External
interactions\](/build/bots/external-interactions) - Timers, webhooks,
custom APIs

\# Onchain Integrations Source:
https://docs.towns.com/build/bots/onchain-integrations

Towns bots are onchain apps with two blockchain capabilities: direct
contract interactions using your bot\'s wallet, and requesting users to
sign transactions or messages.

\## Bot Wallet Architecture

Your bot has two addresses:

\* \*\*Gas wallet\*\* (\`bot.viem.account\`) - Signs and pays for
transactions \* \*\*App address\*\* (\`bot.appAddress\`) - Treasury
wallet (SimpleAccount)

\<Note\> Your gas wallet needs Base ETH for transaction fees. See
\[Getting
Started\](/build/bots/getting-started#understanding-your-bots-wallet-architecture)
for details. \</Note\>

\## Configuration

\### Base RPC URL

For reliable blockchain interactions, configure a custom RPC endpoint.
The default public RPC has strict rate limits.

\`\`\`typescript theme={null} const bot = await makeTownsBot(
process.env.APP_PRIVATE_DATA!, process.env.JWT_SECRET!, { baseRpcUrl:
process.env.BASE_RPC_URL, commands } ) \`\`\`

Add to \`.env\`:

\`\`\`bash theme={null}
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY \`\`\`

We recommend getting a RPC URL from a reputable provider, like
\[Alchemy\](https://www.alchemy.com/).

\## Bot Contract Interactions

\### Reading from Contracts

Read contract state without gas costs:

\`\`\`ts theme={null} import { readContract } from \'viem/actions\'
import simpleAppAbi from \'@towns-protocol/bot/simpleAppAbi\'

const owner = await readContract(bot.viem, { address: bot.appAddress,
abi: simpleAppAbi, functionName: \'moduleOwner\', args: \[\] }) \`\`\`

\### Writing to Contracts

Use \`execute\` from ERC-7821 for any onchain interaction:

\`\`\`ts theme={null} import { execute } from
\'viem/experimental/erc7821\' import { parseEther } from \'viem\' import
{ waitForTransactionReceipt } from \'viem/actions\'

const hash = await execute(bot.viem, { address: bot.appAddress, account:
bot.viem.account, calls: \[{ to: tokenAddress, abi: erc20Abi,
functionName: \'transfer\', args: \[recipientAddress,
parseEther(\'1.0\')\] }\] })

await waitForTransactionReceipt(bot.viem, { hash }) \`\`\`

\### Batch Transactions

Execute multiple operations atomically:

\`\`\`ts theme={null} const hash = await execute(bot.viem, { address:
bot.appAddress, account: bot.viem.account, calls: \[ { to: tokenAddress,
abi: erc20Abi, functionName: \'approve\', args: \[dexAddress, amount\]
}, { to: dexAddress, abi: dexAbi, functionName: \'swap\', args:
\[tokenIn, tokenOut, amount\] } \] }) \`\`\`

All operations succeed or all fail.

\<Note\> To request users to sign transactions or messages, see
\[Interactions\](/build/bots/interactions). This page focuses on
bot-initiated blockchain operations. \</Note\>

\## Utility Functions

\### getSmartAccountFromUserId

Get a user\'s smart account address:

\`\`\`ts theme={null} import { getSmartAccountFromUserId } from
\'@towns-protocol/bot\'

const wallet = await getSmartAccountFromUserId(bot, { userId:
event.userId })

if (wallet) { // Send tokens, check balances, etc. } \`\`\`

Returns \`null\` if no smart account exists.

\*\*Use cases:\*\*

\* Send tokens/NFTs to users \* Airdrop rewards \* Check balances \*
Verify ownership

\## Method Selection Guide

\| Task \| Method \| Learn More \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| Read contract state \| \`readContract\` \| - \| \| Bot sends
transaction \| \`execute\` \| - \| \| Bot sends batch transactions \|
\`execute\` with multiple calls \| - \| \| User sends transaction \|
\`sendInteractionRequest\` (transaction) \|
\[Interactions\](/build/bots/interactions) \| \| User signs message \|
\`sendInteractionRequest\` (signature) \|
\[Interactions\](/build/bots/interactions) \| \| User clicks button/form
\| \`sendInteractionRequest\` (form) \|
\[Interactions\](/build/bots/interactions) \| \| Bot\'s SimpleAccount
operations \| \`writeContract\` \| - \|

\## Next Steps

\* Create \[interactions\](/build/bots/interactions) with buttons and
forms \* Integrate \[external
services\](/build/bots/external-interactions) via webhooks \* Learn
about \[slash commands\](/build/bots/slash-commands) \* Explore \[event
handlers\](/build/bots/events)

\# Roles Source: https://docs.towns.com/build/bots/roles

Bots can create and manage roles in Towns spaces. Roles control what
users can do - from reading messages to banning members. You can also
create token-gated roles that require users to hold specific NFTs or
tokens.

\<Note\> Role management requires your bot to have admin permissions in
the space. All role operations are onchain transactions that require
gas. \</Note\>

\## Creating Roles

\`\`\`ts theme={null} import { Permission } from
\'@towns-protocol/web3\'

const { roleId } = await bot.createRole(spaceId, { name: \'Moderator\',
permissions: \[Permission.Read, Permission.Write,
Permission.ModifyBanning\], users: \[\'0x\...\', \'0x\...\'\] //
optional: only assign to specific users }) \`\`\`

\### CreateRoleParams

\| Parameter \| Type \| Description \| \| \-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| \`name\` \| \`string\` \| Display name for the role \| \|
\`permissions\` \| \`Permission\[\]\` \| Array of permissions to grant
\| \| \`users\` \| \`string\[\]\` \| (Optional) User addresses to assign
the role \| \| \`rule\` \| \`Operation\` \| (Optional) Token-gating rule
(see below) \|

\## Token-Gated Roles

Create roles that require users to hold specific tokens using the
\`Rules\` API:

\`\`\`ts theme={null} import { Permission, Rules } from
\'@towns-protocol/web3\'

const townsHolderRule = Rules.checkErc20({ chainId: 8453n,
contractAddress: \'0x00000000A22C618fd6b4D7E9A335C4B96B189a38\',
threshold: 1n })

const role = await bot.createRole(spaceId, { name: \'Towns Holder\',
permissions: \[Permission.Read, Permission.Write\], rule:
townsHolderRule }) \`\`\`

You can apply the role to a channel by calling
\`bot.addRoleToChannel(channelId, roleId)\`. This will gate the channel
to only users who hold the required tokens.

\`\`\`ts theme={null} await bot.addRoleToChannel(channelId, role.roleId)
\`\`\`

\### Available Rule Types

\| Rule \| Description \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| \`Rules.checkErc721({ chainId, contractAddress, threshold })\` \|
Check ERC721 NFT balance \| \| \`Rules.checkErc20({ chainId,
contractAddress, threshold })\` \| Check ERC20 token balance \| \|
\`Rules.checkErc1155({ chainId, contractAddress, tokenId, threshold })\`
\| Check ERC1155 balance for a specific token ID \| \|
\`Rules.checkEthBalance({ threshold })\` \| Check native ETH balance \|
\| \`Rules.checkIsEntitled({ chainId, contractAddress, params? })\` \|
Check cross-chain entitlement \|

\### Combining Rules

\`\`\`ts theme={null} import { Rules } from \'@towns-protocol/web3\'
import { parseEther } from \'viem\'

// AND: both conditions must pass const andRule = Rules.and(
Rules.checkErc721({ chainId: 8453n, contractAddress: nftContract,
threshold: 1n }), Rules.checkErc20({ chainId: 8453n, contractAddress:
tokenContract, threshold: parseEther(\'100\') }) )

// OR: either condition must pass const orRule = Rules.or(
Rules.checkErc721({ chainId: 8453n, contractAddress: nftContract,
threshold: 1n }), Rules.checkEthBalance({ threshold: parseEther(\'0.1\')
}) )

// All rules must pass. Does not allow failure. Can be nested. const
allRule = Rules.every(ruleA, ruleB, ruleC) // Any rule can pass,
allowing failure. Can be nested. const anyRule = Rules.some(ruleA,
ruleB, ruleC) \`\`\`

\## Managing Roles

\`\`\`ts theme={null} // Get all roles in a space // Returns: Array\<{
id, name, permissions, disabled }\> const roles = await
bot.getAllRoles(spaceId)

// Get full details of a specific role // Returns: { id, name,
permissions, users, ruleData, disabled } \| null const role = await
bot.getRole(spaceId, roleId)

// Update a role. Fields are optional and will only update the fields
that are provided. // Returns: Transaction hash await
bot.updateRole(spaceId, roleId, { name: \'New Name\', users:
\[\'0x\...\', \'0x\...\'\], permissions: \[Permission.Read,
Permission.Write\] })

// Delete a role // Returns: Transaction hash await
bot.deleteRole(spaceId, roleId)

// Add role to a channel, applying the role\'s rules to the channel //
Returns: Transaction hash await bot.addRoleToChannel(channelId, roleId)
\`\`\`

\## Available Permissions

See \[Roles & Entitlements\](/towns-smart-contracts/roles-entitlements)
for the full list of available permissions.

\# Slash Commands Source:
https://docs.towns.com/build/bots/slash-commands

Slash commands are special message types that:

\* Start with \`/\` (e.g., \`/help\`, \`/poll\`, \`/weather\`) \* Show
up in autocomplete when users type \`/\` in Towns \* Display
descriptions to help users understand what they do \* Are handled
separately from regular messages (don\'t trigger \`onMessage\`)

\### Example Commands

\`\`\` /help → Show bot commands /ban \@john → Ban a user /weather San
Francisco → Get weather for a location /remind 5m Check the oven → Set a
reminder \`\`\`

\## Creating commands

Commands are defined in a TypeScript file (typically
\`src/commands.ts\`):

\`\`\`ts src/commands.ts theme={null} import type { BotCommand } from
\'@towns-protocol/bot\'

export const commands = \[ { name: \'help\', description: \'Show
available bot commands\' }, { name: \'ping\', description: \'Check if
bot is responding\' }, { name: \'greet\', description: \'Greet a user\'
}, { name: \'weather\', description: \'Get current weather for a
location\' } \] as const satisfies BotCommand\[\]

export default commands \`\`\`

\## Handling Commands

You can use \`bot.onSlashCommand()\` to handle each slash command:

\`\`\`ts src/index.ts theme={null} import { makeTownsBot } from
\'@towns-protocol/bot\' import commands from \'./commands\'

const bot = await makeTownsBot(appPrivateData, jwtSecret, { commands })

// Handle /help command bot.onSlashCommand(\'help\', async (handler,
event) =\> { const commandList = commands .map(cmd =\> \`•
\\\`/\${cmd.name}\\\` - \${cmd.description}\`) .join(\'\\n\')

await handler.sendMessage( event.channelId, \`\*\*Available
Commands\*\*\\n\${commandList}\` ) })

// Handle /ping command bot.onSlashCommand(\'ping\', async (handler,
event) =\> { const latency = Date.now() - event.createdAt.getTime()
await handler.sendMessage(event.channelId, \`Pong! 🏓 (\${latency}ms)\`)
}) \`\`\`

\### Working with Arguments

Slash commands can receive arguments after the command name.

You can get them from the \`args\` property of the event.

\`\`\`ts theme={null} bot.onSlashCommand(\'weather\', async (handler, {
args, channelId }) =\> { // /weather San Francisco // args: \[\'San\',
\'Francisco\'\]

const location = args.join(\' \')

if (!location) { await handler.sendMessage( channelId, \'Usage: /weather
\<location\>\\nExample: /weather San Francisco\' ) return }

const weather = await callWeatherAPI(location) await
handler.sendMessage( channelId, \`Weather in \${location}:
\${weather.temp}°F, \${weather.conditions}\` ) }) \`\`\`

\### Working with Mentions

Users can mention other users or the bot in slash commands.

You can get the mentions from the \`mentions\` property of the event.

\`\`\`ts theme={null} // /greet \@john \@jane
bot.onSlashCommand(\'greet\', async (handler, { channelId, mentions})
=\> { if (mentions.length === 0) { await handler.sendMessage( channelId,
\'Usage: /greet \@user1 \@user2 \...\' ) return }

const greetings = mentions .map(m =\> \`Hello \<@\${m.userId}\>!\`)
.join(\'\\n\')

await handler.sendMessage(channelId, greetings, { mentions }) }) \`\`\`

\### Checking Permissions

You may want to check if the user has the necessary permissions to use a
command.

You can use the \`hasAdminPermission\` method to check if the user is an
admin. This is a shortcut for checking if the user has the
\`ModifyBanning\` permission.

If you want to check for a specific permission, you can use the
\`checkPermission\` method.

\`\`\`ts theme={null} bot.onSlashCommand(\'ban\', async (handler, {
userId, spaceId, channelId, mentions }) =\> { // Check if user is admin
const isAdmin = await handler.hasAdminPermission(userId, spaceId) if
(!isAdmin) { await handler.sendMessage( channelId, \'❌ Only admins can
use this command\') return } const userToBan = mentions\[0\]?.userId if
(!userToBan) { await handler.sendMessage( channelId, \'Usage: /ban
\@user\') return } try { await handler.ban(userToBan, spaceId) await
handler.sendMessage( channelId, \`✓ Banned \<@\${userToBan}\>\` ) }
catch { await handler.sendMessage( channelId, \'❌ Failed to ban user\')
} }) \`\`\`

\## Paid Commands

You can create commands that require USDC payments in any network.
Payments are processed through the \[x402 protocol\](https://x402.org).

\### Defining Paid Commands

Add a \`paid\` property to your command definition with a price in USDC:

\`\`\`ts src/commands.ts theme={null} import type { BotCommand } from
\'@towns-protocol/bot\'

export const commands = \[ { name: \'generate\', description: \'Generate
AI content\', paid: { price: \'\$0.20\' } } \] as const satisfies
BotCommand\[\]

export default commands \`\`\`

\### How it works

When a user invokes a paid command:

1\. Bot sends a signature request for USDC transfer authorization 2.
User signs the request in their wallet 3. Payment is verified and
settled via the x402 facilitator 4. Your command handler executes after
successful payment

\`\`\`ts src/commands.ts theme={null} export const commands = \[ { name:
\'generate\', description: \'Generate AI content\', paid: { price:
\'\$0.20\' } } \] \`\`\`

\`\`\`ts theme={null} // Handler only runs after payment succeeds
bot.onSlashCommand(\'generate\', async (handler, event) =\> { // Payment
already processed at this point await handler.sendMessage(
event.channelId, \'Thank you for your purchase! Here is your generated
content\...\' ) }) \`\`\`

\## Updating Commands

Commands are automatically synced with Towns when your bot starts.

To update your bot\'s slash commands:

1\. Modify your command definitions in \`src/commands.ts\` 2. Restart
your bot

The new commands will be automatically registered and appear in Towns\'
autocomplete.

\## Next Steps

\* Learn about \[handling other events\](/build/bots/events) \* Explore
\[message formatting and
attachments\](/build/bots/events#sending-attachments) \* See
\[permission-based features\](/build/bots/events#permissions)

\# Troubleshooting Source:
https://docs.towns.com/build/bots/troubleshooting

Common issues and solutions for Towns bots.

\## Bot Doesn\'t Respond

\*\*Check:\*\*

1\. ✅ \`APP_PRIVATE_DATA\` and \`JWT_SECRET\` are correct 2. ✅ Webhook
URL is accessible: \`https://your-bot.com/webhook\` 3. ✅ Bot is
installed in the space (Space Settings → Bots) 4. ✅ Forwarding setting
is correct: \* \*\*\"All Messages\"\*\* - Receives everything \*
\*\*\"Mentions, Commands, Replies & Reactions\"\*\* (Default) - Only
\@mentions, commands, replies \* \*\*\"No Messages\"\*\* - Receives
nothing

\*\*Test webhook:\*\*

\`\`\`bash theme={null} curl https://your-bot.com/health \# Should
respond \`\`\`

\## Lost Context Between Events

\<Warning\> The bot framework is stateless. Each event is isolated - no
access to previous messages or conversation history. \</Warning\>

\*\*Solution:\*\* Store context externally:

\`\`\`ts theme={null} const messageCache = new Map()

bot.onMessage(async (handler, event) =\> {
messageCache.set(event.eventId, event.message)

if (event.replyId) { const original = messageCache.get(event.replyId) //
Now you have the context } }) \`\`\`

For production, use a database. See \[Storing
State\](/build/bots/external-interactions#storing-state).

\## Transaction Errors

\`\`\` Error: insufficient funds for gas \`\`\`

\*\*Problem:\*\* Your bot treasury wallet (\`bot.appAddress\`) needs ETH
for gas.

\*\*Solution:\*\*

\`\`\`ts theme={null} import { formatEther } from \'viem\'

// 1. Check balance const balance = await bot.viem.getBalance({ address:
bot.appAddress }) console.log(\`Balance: \${formatEther(balance)} ETH\`)
console.log(\`Fund this address: \${bot.appAddress}\`)

// 2. Send ETH to bot.appAddress from any wallet

// 3. Verify const newBalance = await bot.viem.getBalance({ address:
bot.appAddress }) \`\`\`

\<Note\> Fund \`bot.appAddress\` (the app contract), not \`bot.botId\`
(the signer). See \[Wallet
Architecture\](/build/bots/getting-started#understanding-your-bots-wallet-architecture).
\</Note\>

\## Can\'t Mention Users

\`\`\`ts theme={null} // ❌ Wrong await handler.sendMessage(channelId,
\"@username hello\")

// ✅ Correct await handler.sendMessage(channelId, \"Hello
\<@0x1234\...\>\", { mentions: \[{ userId: \"0x1234\...\", displayName:
\"username\" }\] }) \`\`\`

\## Slash Commands Not Showing

\*\*Fix:\*\*

\`\`\`ts theme={null} // Pass commands to makeTownsBot import commands
from \'./commands\' const bot = await makeTownsBot(privateData,
jwtSecret, { commands })

// Restart bot after changing commands \`\`\`

\## Rate Limiting

\*\*Use a better RPC:\*\*

\`\`\`ts theme={null} const bot = await makeTownsBot(privateData,
jwtSecret, { baseRpcUrl:
\'https://base-mainnet.g.alchemy.com/v2/YOUR_KEY\' }) \`\`\`

Get free RPC from \[Alchemy\](https://alchemy.com) or
\[Infura\](https://infura.io).

\## Bot Crashes

\*\*Add error handling:\*\*

\`\`\`ts theme={null} bot.onMessage(async (handler, event) =\> { try {
await someAsyncOperation() } catch (error) { console.error(\'Error:\',
error) await handler.sendMessage(event.channelId, \'Something went
wrong\') } }) \`\`\`

\## Next Steps

\* Review \[bot architecture\](/build/bots/introduction) \* Learn about
\[stateless
design\](/build/bots/events#understanding-bot-state-and-context) \* Set
up \[storage\](/build/bots/external-interactions#storing-state)

\# Delegate Key Signing Source:
https://docs.towns.com/build/delegate-key-signing

\### Delegate Key Signing

All events in the Towns Protocol are signed by an
\[ECDSA\](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)
wallet key pair. Users and nodes can both send events using a process
referred to as delegate signing that allows for events to be signed by a
separate device linked to the primary wallet. Delegate signing therefore
opens the protocol to allow events from linked devices the user has
custody of. Towns Stream Nodes validate the signature prior to
processing an event that is for example being added to a stream using
\`addEvent\` RPC method.

\<Note\>Why ECDSA ? First,
\[ECDSA\](https://blog.cloudflare.com/ecdsa-the-digital-signature-algorithm-of-a-better-internet)
elliptic curve derived keys have been proven to be less susceptible to
breaking than earlier algorithms such as RSA. Secondly, ECDSA keys are
smaller at 256-bytes and less cpu intensive to generate signatures than
asymmetric or RSA keys. Since Towns Stream Nodes validate and store
signatures in storage for each event, using ECDSA signatures saves on
cpu and disk space. \</Note\>

The rules and construction of the delegate key signature are the topic
of this page.

\### Delegate Signature Protocol Rules

The logic dictating how a Towns Stream Node should process delegate
signatures on the critical path of a request is described in
\`protocol.proto\` and defined in \`delegate.go\`.

Events sent over RPC to a Towns Stream Node are sent with a message
\`Envelope\` that includes several fields used to validate the sender.

\<img alt=\"Wire Payload\" /\>

\* \*\*signature\*\* : For the event to be valid, the signature on the
\`Envelope\` must match the \`Event\` creator\\\_address or be signed by
the same address implied by \`Event\` delegate\\\_sig. \*
\*\*creator\\\_address\*\* : This is the wallet address of the creator
of the event, which can be a user or a Towns Stream Node. \*
\*\*delegate\\\_sig\*\* : Optional field that allows events to be signed
by a device keypair linked to the user\'s primary wallet.

\<Note\>If a delegate signature is present on an event, the event is
only valid if either the creator\\\_address matches the
delegate\\\_sig\'s signer public key or if the delegate\\\_sig signing
public key matches the key implied by Envelope.signature.\</Note\>

\### Delegate Signature Validation

Each event on a Towns Stream Node is parsed and validated as follows.

\<Steps\> \<Step title=\"Unmarshal Bytes\"\> Events are stored as bytes
in Towns Stream Node storage and transmitted as bytes over the wire. All
events are unmarshalled first and then parsed to run a series of
validity checks prior to storing those events.

\`\`\`go theme={null} // stream_view.go example unpacking and parsing of
events var env Envelope // e is \[\]\[\]byte err := proto.Unmarshal(e,
&env) if err != nil { return nil, err } parsed, err := ParseEvent(&env)
if err != nil { return nil, err } \`\`\` \</Step\>

\<Step title=\"Towns Hash\"\> The event hash is first validated using
\`RiverHash\` function found in \`sign.go\`.

\`\`\`go theme={null} // sign.go func RiverHash(buffer \[\]byte)
\[\]byte { hash := sha3.NewLegacyKeccak256() writeOrPanic(hash,
HASH_HEADER) // Write length of buffer as 64-bit little endian uint. err
:= binary.Write(hash, binary.LittleEndian, uint64(len(buffer))) if err
!= nil { panic(err) } writeOrPanic(hash, HASH_SEPARATOR)
writeOrPanic(hash, buffer) writeOrPanic(hash, HASH_FOOTER) return
hash.Sum(nil) }

\`\`\` \</Step\>

\<Step title=\"Check Delegate Signature\"\> Once the hash is confirmed
as valid for the event, the hash along with the envelope signature is
used to recover the signer public key.

\`\`\`go theme={null} // parsed_event.go func ParseEvent(envelope
\*Envelope) (\*ParsedEvent, error) { \...

signerPubKey, err := RecoverSignerPublicKey(hash, envelope.Signature) if
err != nil { return nil, err }

var streamEvent StreamEvent err = proto.Unmarshal(envelope.Event,
&streamEvent) if err != nil { return nil, err }

if len(streamEvent.DelegateSig) \> 0 { err =
CheckDelegateSig(streamEvent.CreatorAddress, signerPubKey,
streamEvent.DelegateSig) if err != nil { // The old style signature is a
standard ethereum message signature. // TODO(HNT-1380): once we switch
to the new signing model, remove this call err2 :=
CheckEthereumMessageSignature(streamEvent.CreatorAddress, signerPubKey,
streamEvent.DelegateSig) if err2 != nil { return nil,
WrapRiverError(Err_BAD_EVENT_SIGNATURE, err).Message(\"Bad
signature\").Func(\"ParseEvent\").Tag(\"error2\", err2) } } } else {
address := PublicKeyToAddress(signerPubKey) if
!bytes.Equal(address.Bytes(), streamEvent.CreatorAddress) { return nil,
RiverError(Err_BAD_EVENT_SIGNATURE, \"Bad signature provided\",
\"computed address\", address, \"event creatorAddress\",
streamEvent.CreatorAddress) } } \... \`\`\` \</Step\>

\<Step title=\"Check Delegate Signature\"\> If the delegate signature is
present on the event, the creator address is used in conjunction with
the previously retrieved public key and delegate signature to prove that
the signature was signed by the creator.

\`\`\`go theme={null} // delegate.go func
CheckDelegateSig(expectedAddress \[\]byte, devicePubKey, delegateSig
\[\]byte) error { recoveredAddress, err :=
RecoverDelegateSigAddress(devicePubKey, delegateSig) if err != nil {
return err } if !bytes.Equal(expectedAddress, recoveredAddress.Bytes())
{ return RiverError(Err_BAD_EVENT_SIGNATURE, \"Bad signature provided\",
\"computed_address\", recoveredAddress, \"event_creatorAddress\",
expectedAddress) } return nil } \`\`\` \</Step\> \</Steps\>

\<Note\>Event creator wallets used to sign events are assumed to be
created as Ethereum wallets. Therefore, \`secp256k1\` algorithm is used
to validate signature and sign. Towns Stream Nodes use a hardened
version of this algorithm found in
\[go-ethereum\](https://github.com/ethereum/go-ethereum/tree/master/crypto/secp256k1)
package. \</Note\>

\### Node Delegate Events

Towns Stream Nodes are created with an ECDSA wallet used for identity
and so can create events destined for streams in the network just like
users using their Ethereum wallet as a primary wallet or another linked
wallet created using
\[ECDSA\](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm).

Nodes create new wallets using \`go-ethereum\` crypto tools in the
following function.

\`\`\`go theme={null} // sign.go func NewWallet(ctx context.Context)
(\*Wallet, error) { log := dlog.CtxLog(ctx)

key, err := crypto.GenerateKey() if err != nil { return nil, err }
address := crypto.PubkeyToAddress(key.PublicKey)

log.Infof(\"New wallet generated.\", \"address\", address.Hex(),
\"publicKey\", crypto.FromECDSAPub(&key.PublicKey)) return &Wallet{
PrivateKeyStruct: key, PrivateKey: crypto.FromECDSA(key), Address:
address, AddressStr: address.Hex(), }, nil } \`\`\`

\# Getting Started Source:
https://docs.towns.com/build/miniapps/getting-started

To build a Mini App for Towns, follow the \[Farcaster Getting Started
guide\](https://miniapps.farcaster.xyz/docs/getting-started).

\## Sharing Mini Apps in Towns

Once you\'ve built your Mini App, you can share it in Towns in two ways:

\### 1. Via Bots

Bots can share Mini Apps as attachments in messages:

\`\`\`typescript theme={null} await bot.sendMessage(channelId, \"Check
out this Mini App!\", { attachments: \[{ type: \'miniapp\', url:
\'https://your-miniapp.com\' }\] }) \`\`\`

\### 2. Via Direct URLs

Users can paste Mini App URLs directly in Towns conversations. The Towns
client will automatically render compatible Mini Apps.

\# Introduction Source:
https://docs.towns.com/build/miniapps/introduction

Mini Apps enable developers to distribute apps to Towns users without
requiring app store approval.

Towns follows the \[Farcaster miniapp
specification\](https://miniapps.farcaster.xyz/), allowing developers to
build interactive experiences using HTML, CSS, and JavaScript.

\## What are Mini Apps?

Mini Apps are web applications that run within Towns, providing users
with interactive experiences directly in their conversations. They can:

\* Access user context and Towns-specific data \* Integrate with
Ethereum wallets \* Compose messages back to Towns \* Provide rich,
interactive experiences without leaving the app

\## Getting Started

For a complete guide on building Mini Apps, refer to the \[Farcaster
Mini Apps documentation\](https://miniapps.farcaster.xyz/).

Towns extends the Farcaster specification with additional context data.
See the \[SDK\](/build/miniapps/sdk) documentation for Towns-specific
extensions.

\# SDK Source: https://docs.towns.com/build/miniapps/sdk

Towns extends the Farcaster miniapp specification with additional
context data specific to the Towns platform.

You can find the original Farcaster miniapp specification
\[here\](https://miniapps.farcaster.xyz/docs/specification).

Towns expect you to follow the \[metatags specified in the Farcaster
miniapp
specification\](https://miniapps.farcaster.xyz/docs/specification#metatags).

\## Context

\### context.user

Towns provides information about the currently connected user:

\* \`username\` - Username of the user. Can change per channel. \*
\`displayName\` - Display name of the user. Can change per channel. \*
\`pfpUrl\` - Profile image URL of the user.

\### context.towns

Towns-specific data about the current session:

\* \`user\` \* \`userId\` - The Towns UserId of the user currently
connected to the miniapp \* \`address\` - The Towns App Smart Wallet
address of the connected user \* \`env\` - Environment identifier:
\`alpha\` (testnet) or \`omega\` (production) \* \`spaceId\` - The Space
ID if the user is interacting from a space (optional) \* \`channelId\` -
The Channel ID where the user is interacting from. This can be a Space
Channel, DM, or GDM.

\## Actions

Towns supports the following Farcaster miniapp actions:

\### Core Actions

\* \`actions.ready\` - Notify when miniapp is ready \*
\`actions.openUrl\` - Open external URLs in a new window \*
\`actions.close\` - Close the miniapp \* \`actions.composeCast\` -
Compose messages in Towns with optional text and embeds \*
\`actions.getCapabilities\` - Get list of supported capabilities \*
\`actions.getChains\` - Get supported blockchain chains

\### Wallet Actions

\* \`wallet.getEthereumProvider\` - Get Ethereum wallet provider for the
Towns Smart Wallet \* \`wallet.ethProviderRequest\` - Make Ethereum
provider requests using the connected wallet \*
\`wallet.eip6963RequestProvider\` - Announce Ethereum provider via
EIP-6963

\# TownsSyncProvider Source:
https://docs.towns.com/build/react-sdk/api/TownsSyncProvider

Provides the sync agent to all hooks usage that interacts with the Towns
Protocol.

\* If you want to interact with the sync agent directly, you can use the
\`useSyncAgent\` hook. - If you want to interact with the Towns Protocol
using hooks provided by this SDK, you should wrap your App with this
provider.

You can pass an initial sync agent instance to the provider. This can be
useful for persisting authentication.

\## Imports

\`\`\`ts theme={null} import { TownsSyncProvider } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function TownsSyncProvider( props: { syncAgent?:
SyncAgent; config?: { onTokenExpired?: () =\> void; }; children?:
React.ReactNode; }, ): JSX.Element \`\`\`

\*\*Source:\*\*
\[TownsSyncProvider\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/TownsSyncProvider.tsx)

\## Parameters

\### props

\* \*\*Type:\*\* \`{ syncAgent?: SyncAgent; config?: { onTokenExpired?:
() =\> void; }; children?: React.ReactNode; }\`

The props for the provider

\## Return Type

The provider

\`\`\`ts theme={null} JSX.Element \`\`\`

\# connectTowns Source:
https://docs.towns.com/build/react-sdk/api/connectTowns

Connect to Towns using a SignerContext

Useful for server side code, allowing you to persist the signer context
and use it to auth with Towns later

\## Imports

\`\`\`ts theme={null} import { connectTowns } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function connectTowns( signerContext:
SignerContext, config: Omit\<SyncAgentConfig, \"context\"\>, ):
Promise\<SyncAgent\> \`\`\`

\*\*Source:\*\*
\[connectTowns\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/connectTowns.ts)

\## Parameters

\### signerContext

\* \*\*Type:\*\* \`SignerContext\`

The signer context to use

\### config

\* \*\*Type:\*\* \`Omit\<SyncAgentConfig, \"context\"\>\`

The configuration for the sync agent

\## Return Type

The sync agent

\`\`\`ts theme={null} Promise\<SyncAgent\> \`\`\`

\# connectTownsWithBearerToken Source:
https://docs.towns.com/build/react-sdk/api/connectTownsWithBearerToken

Connect to Towns using a Bearer Token Towns clients can use this to
connect to Towns Protocol on behalf of a user

Useful for server side code, allowing you to persist the signer context
and use it to auth with Towns later

\## Imports

\`\`\`ts theme={null} import { connectTownsWithBearerToken } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function connectTownsWithBearerToken( token:
string, config: Omit\<SyncAgentConfig, \"context\"\>, ):
Promise\<SyncAgent\> \`\`\`

\*\*Source:\*\*
\[connectTownsWithBearerToken\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/connectTowns.ts)

\## Parameters

\### token

\* \*\*Type:\*\* \`string\`

The bearer token to use

\### config

\* \*\*Type:\*\* \`Omit\<SyncAgentConfig, \"context\"\>\`

The configuration for the sync agent

\## Return Type

The sync agent

\`\`\`ts theme={null} Promise\<SyncAgent\> \`\`\`

\# getRoom Source: https://docs.towns.com/build/react-sdk/api/getRoom

\## Imports

\`\`\`ts theme={null} import { getRoom } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function getRoom( sync: SyncAgent, streamId:
string, ): Gdm \| Channel \| Dm \| Space \`\`\`

\*\*Source:\*\*
\[getRoom\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/utils.ts)

\## Parameters

\### sync

\* \*\*Type:\*\* \`SyncAgent\`

\### streamId

\* \*\*Type:\*\* \`string\`

\## Return Type

\`\`\`ts theme={null} Gdm \| Channel \| Dm \| Space \`\`\`

\# signAndConnect Source:
https://docs.towns.com/build/react-sdk/api/signAndConnect

Sign and connect to Towns using a Signer and a random delegate wallet
every time

\## Imports

\`\`\`ts theme={null} import { signAndConnect } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function signAndConnect( signer: ethers.Signer,
config: Omit\<SyncAgentConfig, \"context\"\>, ): Promise\<SyncAgent\>
\`\`\`

\*\*Source:\*\*
\[signAndConnect\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/connectTowns.ts)

\## Parameters

\### signer

\* \*\*Type:\*\* \`ethers.Signer\`

The signer to use

\### config

\* \*\*Type:\*\* \`Omit\<SyncAgentConfig, \"context\"\>\`

The configuration for the sync agent

\## Return Type

The sync agent

\`\`\`ts theme={null} Promise\<SyncAgent\> \`\`\`

\# useAdminRedact Source:
https://docs.towns.com/build/react-sdk/api/useAdminRedact

Hook to redact any message in a channel if you\'re an admin.

\## Imports

\`\`\`ts theme={null} import { useAdminRedact } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Examples

\### Redact a message

You can use \`adminRedact\` to redact a message in a stream.

\`\`\`ts theme={null} import { useAdminRedact } from
\'@towns-protocol/react-sdk\'

const { adminRedact } = useAdminRedact(streamId) adminRedact({ eventId:
messageEventId }) \`\`\`

\### Redact a message reaction

You can also use \`redact\` to redact a message reaction in a stream.

\`\`\`ts theme={null} import { useRedact } from
\'@towns-protocol/react-sdk\'

const { redact } = useRedact(streamId) redact({ eventId: reactionEventId
}) \`\`\`

\## Definition

\`\`\`ts theme={null} function useAdminRedact( streamId: string,
config?: ActionConfig\<Channel\[\"adminRedact\"\]\>, ): { data: {
eventId: string; } \| undefined; error: Error \| undefined; isPending:
boolean; isSuccess: boolean; isError: boolean; adminRedact: (eventId:
string) =\> Promise\<{ eventId: string; }\>; } \`\`\`

\*\*Source:\*\*
\[useAdminRedact\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useAdminRedact.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to redact the message in.

\### config

\* \*\*Type:\*\* \`ActionConfig\<Channel\[\"adminRedact\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`redact\` action and its loading state.

\`\`\`ts theme={null} { data: { eventId: string; } \| undefined; error:
Error \| undefined; isPending: boolean; isSuccess: boolean; isError:
boolean; adminRedact: (eventId: string) =\> Promise\<{ eventId: string;
}\>; } \`\`\`

\# useAgentConnection Source:
https://docs.towns.com/build/react-sdk/api/useAgentConnection

Hook for managing the connection to the sync agent

\## Imports

\`\`\`ts theme={null} import { useAgentConnection } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Examples

You can connect the Sync Agent to Towns Protocol using a Bearer Token or
using a Signer.

\### Bearer Token

\`\`\`tsx theme={null} import { useAgentConnection } from
\'@towns-protocol/react-sdk\' import { townsEnv } from
\'@towns-protocol/sdk\' import { useState } from \'react\'

const townsConfig = townsEnv().makeTownsConfig(\'beta\')

const Login = () =\> { const { connectUsingBearerToken,
isAgentConnecting, isAgentConnected } = useAgentConnection() const
\[bearerToken, setBearerToken\] = useState(\'\')

return ( \<\> \<input value={bearerToken} onChange={(e) =\>
setBearerToken(e.target.value)} /\> \<button onClick={() =\>
connectUsingBearerToken(bearerToken, { townsConfig })}\> Login
\</button\> {isAgentConnecting && \<span\>Connecting\... ⏳\</span\>}
{isAgentConnected && \<span\>Connected ✅\</span\>} \</\> ) } \`\`\`

\### Signer

If you\'re using Wagmi and Viem, you can use the
\[\`useEthersSigner\`\](https://wagmi.sh/react/guides/ethers#usage-1)
hook to get an ethers.js v5 Signer from a Viem Wallet Client.

\`\`\`tsx theme={null} import { useAgentConnection } from
\'@towns-protocol/react-sdk\' import { townsEnv } from
\'@towns-protocol/sdk\' import { useEthersSigner } from
\'./utils/viem-to-ethers\'

const townsConfig = townsEnv().makeTownsConfig(\'beta\')

const Login = () =\> { const { connect, isAgentConnecting,
isAgentConnected } = useAgentConnection() const signer =
useEthersSigner()

return ( \<\> \<button onClick={async () =\> { if (!signer) { return }
connect(signer, { townsConfig }) }}\> Login \</button\>
{isAgentConnecting && \<span\>Connecting\... ⏳\</span\>}
{isAgentConnected && \<span\>Connected ✅\</span\>} \</\> ) } \`\`\`

\## Definition

\`\`\`ts theme={null} function useAgentConnection(): { connect: (signer:
ethers.Signer, config: AgentConnectConfig) =\> Promise\<SyncAgent \|
undefined\>; connectUsingBearerToken: (bearerToken: string, config:
AgentConnectConfig) =\> Promise\<SyncAgent \| undefined\>; disconnect:
() =\> void \| undefined; isAgentConnecting: boolean; isAgentConnected:
boolean; env: string \| undefined; } \`\`\`

\*\*Source:\*\*
\[useAgentConnection\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useAgentConnection.ts)

\## Return Type

The connection state and methods (connect, connectUsingBearerToken,
disconnect)

\`\`\`ts theme={null} { connect: (signer: ethers.Signer, config:
AgentConnectConfig) =\> Promise\<SyncAgent \| undefined\>;
connectUsingBearerToken: (bearerToken: string, config:
AgentConnectConfig) =\> Promise\<SyncAgent \| undefined\>; disconnect:
() =\> void \| undefined; isAgentConnecting: boolean; isAgentConnected:
boolean; env: string \| undefined; } \`\`\`

\# useChannel Source:
https://docs.towns.com/build/react-sdk/api/useChannel

Hook to get data about a channel. You can use this hook to get channel
metadata and if the user has joined the channel.

\## Imports

\`\`\`ts theme={null} import { useChannel } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useChannel( spaceId: string, channelId:
string, config?: ObservableConfig.FromObservable\<Channel\>, ):
ObservableValue\<ChannelModel\> \`\`\`

\*\*Source:\*\*
\[useChannel\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useChannel.ts)

\## Parameters

\### spaceId

\* \*\*Type:\*\* \`string\`

The id of the space the channel belongs to.

\### channelId

\* \*\*Type:\*\* \`string\`

The id of the channel to get data about.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromObservable\<Channel\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The ChannelModel data.

\`\`\`ts theme={null} ObservableValue\<ChannelModel\> \`\`\`

\# useCreateChannel Source:
https://docs.towns.com/build/react-sdk/api/useCreateChannel

Hook to create a channel.

\## Imports

\`\`\`ts theme={null} import { useCreateChannel } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useCreateChannel( spaceId: string,
config?: ActionConfig\<Space\[\"createChannel\"\]\>, ): { data: string
\| undefined; error: Error \| undefined; isPending: boolean; isSuccess:
boolean; isError: boolean; createChannel: (channelName: string, signer:
Signer, opts?: { topic?: string; } \| undefined) =\> Promise\<string\>;
} \`\`\`

\*\*Source:\*\*
\[useCreateChannel\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useCreateChannel.ts)

\## Parameters

\### spaceId

\* \*\*Type:\*\* \`string\`

\### config

\* \*\*Type:\*\* \`ActionConfig\<Space\[\"createChannel\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`createChannel\` action and its loading state.

\`\`\`ts theme={null} { data: string \| undefined; error: Error \|
undefined; isPending: boolean; isSuccess: boolean; isError: boolean;
createChannel: (channelName: string, signer: Signer, opts?: { topic?:
string; } \| undefined) =\> Promise\<string\>; } \`\`\`

\# useCreateDm Source:
https://docs.towns.com/build/react-sdk/api/useCreateDm

A hook that allows you to create a new direct message (DM).

\## Imports

\`\`\`ts theme={null} import { useCreateDm } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useCreateDm( config?:
ActionConfig\<Dms\[\"createDM\"\]\>, ): { data: { streamId: string; } \|
undefined; error: Error \| undefined; isPending: boolean; isSuccess:
boolean; isError: boolean; createDM: (userId: string, appAddress?:
string \| undefined, streamSettings?: { disableMiniblockCreation:
boolean; lightStream: boolean; } \| undefined) =\> Promise\<{ streamId:
string; }\>; } \`\`\`

\*\*Source:\*\*
\[useCreateDm\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useCreateDm.ts)

\## Parameters

\### config

\* \*\*Type:\*\* \`ActionConfig\<Dms\[\"createDM\"\]\>\` \*
\*\*Optional\*\*

The action config.

\## Return Type

An object containing the \`createDM\` action and the rest of the action
result.

\`\`\`ts theme={null} { data: { streamId: string; } \| undefined; error:
Error \| undefined; isPending: boolean; isSuccess: boolean; isError:
boolean; createDM: (userId: string, appAddress?: string \| undefined,
streamSettings?: { disableMiniblockCreation: boolean; lightStream:
boolean; } \| undefined) =\> Promise\<{ streamId: string; }\>; } \`\`\`

\# useCreateGdm Source:
https://docs.towns.com/build/react-sdk/api/useCreateGdm

A hook that allows you to create a new group direct message (GDM).

\## Imports

\`\`\`ts theme={null} import { useCreateGdm } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useCreateGdm( config?:
ActionConfig\<Gdms\[\"createGDM\"\]\>, ): { data: { streamId: string; }
\| undefined; error: Error \| undefined; isPending: boolean; isSuccess:
boolean; isError: boolean; createGDM: (userIds: string\[\],
channelProperties?: EncryptedData \| undefined, streamSettings?: {
disableMiniblockCreation: boolean; lightStream: boolean; } \| undefined)
=\> Promise\<{ streamId: string; }\>; } \`\`\`

\*\*Source:\*\*
\[useCreateGdm\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useCreateGdm.ts)

\## Parameters

\### config

\* \*\*Type:\*\* \`ActionConfig\<Gdms\[\"createGDM\"\]\>\` \*
\*\*Optional\*\*

The action config.

\## Return Type

An object containing the \`createGDM\` action and the rest of the action
result.

\`\`\`ts theme={null} { data: { streamId: string; } \| undefined; error:
Error \| undefined; isPending: boolean; isSuccess: boolean; isError:
boolean; createGDM: (userIds: string\[\], channelProperties?:
EncryptedData \| undefined, streamSettings?: { disableMiniblockCreation:
boolean; lightStream: boolean; } \| undefined) =\> Promise\<{ streamId:
string; }\>; } \`\`\`

\# useCreateSpace Source:
https://docs.towns.com/build/react-sdk/api/useCreateSpace

Hook to create a space.

\## Imports

\`\`\`ts theme={null} import { useCreateSpace } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useCreateSpace( config?:
ActionConfig\<Spaces\[\"createSpace\"\]\>, ): { data: { spaceId: string;
defaultChannelId: string; } \| undefined; error: Error \| undefined;
isPending: boolean; isSuccess: boolean; isError: boolean; createSpace:
(params: Partial\<Omit\<CreateSpaceParams, \"spaceName\"\>\> & {
spaceName: string; }, signer: Signer) =\> Promise\<{ spaceId: string;
defaultChannelId: string; }\>; } \`\`\`

\*\*Source:\*\*
\[useCreateSpace\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useCreateSpace.ts)

\## Parameters

\### config

\* \*\*Type:\*\* \`ActionConfig\<Spaces\[\"createSpace\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`createSpace\` action and its loading state.

\`\`\`ts theme={null} { data: { spaceId: string; defaultChannelId:
string; } \| undefined; error: Error \| undefined; isPending: boolean;
isSuccess: boolean; isError: boolean; createSpace: (params:
Partial\<Omit\<CreateSpaceParams, \"spaceName\"\>\> & { spaceName:
string; }, signer: Signer) =\> Promise\<{ spaceId: string;
defaultChannelId: string; }\>; } \`\`\`

\# useDm Source: https://docs.towns.com/build/react-sdk/api/useDm

Hook to get the data of a DM. You can use this hook to get DM metadata
and if the user has joined the DM.

\## Imports

\`\`\`ts theme={null} import { useDm } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useDm( streamId: string, config?:
ObservableConfig.FromData\<DmModel\>, ): ObservableValue\<DmModel\>
\`\`\`

\*\*Source:\*\*
\[useDm\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useDm.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the DM to get the data of.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromData\<DmModel\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The DmModel of the DM.

\`\`\`ts theme={null} ObservableValue\<DmModel\> \`\`\`

\# useGdm Source: https://docs.towns.com/build/react-sdk/api/useGdm

Hook to get the data of a Group DM. You can use this hook to get Group
DM metadata and if the user has joined the Group DM.

\## Imports

\`\`\`ts theme={null} import { useGdm } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useGdm( streamId: string, config?:
ObservableConfig.FromData\<GdmModel\>, ): ObservableValue\<GdmModel\>
\`\`\`

\*\*Source:\*\*
\[useGdm\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useGdm.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the Group DM to get the data of.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromData\<GdmModel\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The GdmModel of the Group DM.

\`\`\`ts theme={null} ObservableValue\<GdmModel\> \`\`\`

\# useJoinSpace Source:
https://docs.towns.com/build/react-sdk/api/useJoinSpace

Hook to join a space.

\## Imports

\`\`\`ts theme={null} import { useJoinSpace } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useJoinSpace( config?:
ActionConfig\<Spaces\[\"joinSpace\"\]\>, ): { data: void \| undefined;
error: Error \| undefined; isPending: boolean; isSuccess: boolean;
isError: boolean; joinSpace: (spaceId: string, signer: Signer, opts?: {
skipMintMembership?: boolean; } \| undefined) =\> Promise\<void\>; }
\`\`\`

\*\*Source:\*\*
\[useJoinSpace\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useJoinSpace.ts)

\## Parameters

\### config

\* \*\*Type:\*\* \`ActionConfig\<Spaces\[\"joinSpace\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The joinSpace action and the status of the action.

\`\`\`ts theme={null} { data: void \| undefined; error: Error \|
undefined; isPending: boolean; isSuccess: boolean; isError: boolean;
joinSpace: (spaceId: string, signer: Signer, opts?: {
skipMintMembership?: boolean; } \| undefined) =\> Promise\<void\>; }
\`\`\`

\# useMember Source:
https://docs.towns.com/build/react-sdk/api/useMember

Hook to get data from a specific member of a Space, GDM, Channel, or DM.

\## Imports

\`\`\`ts theme={null} import { useMember } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useMember( props: { streamId: string;
userId: string; }, config?: ObservableConfig.FromObservable\<Member\>,
): { error: Error \| undefined; status: \"loading\" \| \"loaded\" \|
\"error\"; isLoading: boolean; isError: boolean; isLoaded: boolean;
userId: string; streamId: string; initialized: boolean; username:
string; isUsernameConfirmed: boolean; isUsernameEncrypted: boolean;
displayName: string; isDisplayNameEncrypted: boolean \| undefined;
ensAddress: string \| undefined; nft: NftModel \| undefined; membership:
MembershipOp \| undefined; } \`\`\`

\*\*Source:\*\*
\[useMember\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useMember.ts)

\## Parameters

\### props

\* \*\*Type:\*\* \`{ streamId: string; userId: string; }\`

The streamId and userId of the member to get data from.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromObservable\<Member\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The Member data.

\`\`\`ts theme={null} { error: Error \| undefined; status: \"loading\"
\| \"loaded\" \| \"error\"; isLoading: boolean; isError: boolean;
isLoaded: boolean; userId: string; streamId: string; initialized:
boolean; username: string; isUsernameConfirmed: boolean;
isUsernameEncrypted: boolean; displayName: string;
isDisplayNameEncrypted: boolean \| undefined; ensAddress: string \|
undefined; nft: NftModel \| undefined; membership: MembershipOp \|
undefined; } \`\`\`

\# useMemberList Source:
https://docs.towns.com/build/react-sdk/api/useMemberList

Hook to get the members userIds of a Space, GDM, Channel, or DM. Used
with useMember to get data from a specific member.

\## Imports

\`\`\`ts theme={null} import { useMemberList } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useMemberList( streamId: string, config?:
ObservableConfig.FromData\<MembersModel\>, ):
ObservableValue\<MembersModel\> \`\`\`

\*\*Source:\*\*
\[useMemberList\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useMemberList.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to get the members of.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromData\<MembersModel\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The MembersModel of the stream, containing the userIds of the members.

\`\`\`ts theme={null} ObservableValue\<MembersModel\> \`\`\`

\# useMyMember Source:
https://docs.towns.com/build/react-sdk/api/useMyMember

Hook to get the data of the current user in a stream.

\## Imports

\`\`\`ts theme={null} import { useMyMember } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useMyMember( streamId: string, config?:
ObservableConfig.FromObservable\<Member\>, ): { id: string; userId:
string; streamId: string; initialized: boolean; username: string;
isUsernameConfirmed: boolean; isUsernameEncrypted: boolean; displayName:
string; isDisplayNameEncrypted?: boolean; ensAddress?: string; nft?:
NftModel; membership?: MembershipOp; appAddress?: string; } \`\`\`

\*\*Source:\*\*
\[useMyMember\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useMyMember.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to get the current user of.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromObservable\<Member\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The MemberModel of the current user.

\`\`\`ts theme={null} { id: string; userId: string; streamId: string;
initialized: boolean; username: string; isUsernameConfirmed: boolean;
isUsernameEncrypted: boolean; displayName: string;
isDisplayNameEncrypted?: boolean; ensAddress?: string; nft?: NftModel;
membership?: MembershipOp; appAddress?: string; } \`\`\`

\# useObservable Source:
https://docs.towns.com/build/react-sdk/api/useObservable

This hook subscribes to an observable and returns the value of the
observable.

\## Imports

\`\`\`ts theme={null} import { useObservable } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useObservable\<Model, Data\>( observable:
Observable\<Model\>, config?: ObservableConfig.FromData\<Model\>, ):
ObservableValue\<Data\> \`\`\`

\*\*Source:\*\*
\[useObservable\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useObservable.ts)

\## Parameters

\### observable

\* \*\*Type:\*\* \`Observable\<Model\>\`

The observable to subscribe to.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromData\<Model\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\#### config.fireImmediately

\* \*\*Type:\*\* \`boolean\` \* \*\*Optional\*\*

Trigger the update immediately, without waiting for the first update.

\#### config.onError

\* \*\*Type:\*\* \`(error: Error) =\> void\` \* \*\*Optional\*\*

Callback function to be called when an error occurs.

\#### config.onUpdate

\* \*\*Type:\*\* \`(data: Data) =\> void\` \* \*\*Optional\*\*

Callback function to be called when the data is updated.

\## Return Type

The value of the observable.

\`\`\`ts theme={null} ObservableValue\<Data\> \`\`\`

\# useReactions Source:
https://docs.towns.com/build/react-sdk/api/useReactions

Hook to get the reactions of a specific stream.

\## Imports

\`\`\`ts theme={null} import { useReactions } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useReactions( streamId: string, config?:
ObservableConfig.FromData\<Record\<string, MessageReactions\>\>, ):
ObservableValue\<Record\<string, MessageReactions\>\> \`\`\`

\*\*Source:\*\*
\[useReactions\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useReactions.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to get the reactions of.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromData\<Record\<string,
MessageReactions\>\>\` \* \*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The reactions of the stream as a map from the message eventId to the
reaction.

\`\`\`ts theme={null} ObservableValue\<Record\<string,
MessageReactions\>\> \`\`\`

\# useRedact Source:
https://docs.towns.com/build/react-sdk/api/useRedact

Hook to redact your own message in a channel stream.

\## Imports

\`\`\`ts theme={null} import { useRedact } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Examples

\### Redact a message

You can use \`redact\` to redact a message in a stream.

\`\`\`ts theme={null} import { useRedact } from
\'@towns-protocol/react-sdk\'

const { redact } = useRedact(streamId) redact({ eventId: messageEventId
}) \`\`\`

\### Redact a message reaction

You can also use \`redact\` to redact a message reaction in a stream.

\`\`\`ts theme={null} import { useRedact } from
\'@towns-protocol/react-sdk\'

const { redact } = useRedact(streamId) redact({ eventId: reactionEventId
}) \`\`\`

\## Definition

\`\`\`ts theme={null} function useRedact( streamId: string, config?:
ActionConfig\<Channel\[\"redact\"\]\>, ): { data: { eventId: string; }
\| undefined; error: Error \| undefined; isPending: boolean; isSuccess:
boolean; isError: boolean; redact: (eventId: string, reason?: string \|
undefined) =\> Promise\<{ eventId: string; }\>; } \`\`\`

\*\*Source:\*\*
\[useRedact\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useRedact.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to redact the message in.

\### config

\* \*\*Type:\*\* \`ActionConfig\<Channel\[\"redact\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`redact\` action and its loading state.

\`\`\`ts theme={null} { data: { eventId: string; } \| undefined; error:
Error \| undefined; isPending: boolean; isSuccess: boolean; isError:
boolean; redact: (eventId: string, reason?: string \| undefined) =\>
Promise\<{ eventId: string; }\>; } \`\`\`

\# useScrollback Source:
https://docs.towns.com/build/react-sdk/api/useScrollback

Hook to get the scrollback action for a stream.

Scrollback is the action of getting miniblocks from a stream before a
certain point in time. Getting miniblocks means that new events that are
possibly new messages, reactions and so on are fetched.

\## Imports

\`\`\`ts theme={null} import { useScrollback } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useScrollback( streamId: string, config?:
ActionConfig\<MessageTimeline\[\"scrollback\"\]\>, ): { data: {
terminus: boolean; fromInclusiveMiniblockNum: bigint; } \| undefined;
error: Error \| undefined; isPending: boolean; isSuccess: boolean;
isError: boolean; scrollback: () =\> Promise\<{ terminus: boolean;
fromInclusiveMiniblockNum: bigint; }\>; } \`\`\`

\*\*Source:\*\*
\[useScrollback\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useScrollback.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to get the scrollback action for.

\### config

\* \*\*Type:\*\* \`ActionConfig\<MessageTimeline\[\"scrollback\"\]\>\`
\* \*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`scrollback\` action and its loading state.

\`\`\`ts theme={null} { data: { terminus: boolean;
fromInclusiveMiniblockNum: bigint; } \| undefined; error: Error \|
undefined; isPending: boolean; isSuccess: boolean; isError: boolean;
scrollback: () =\> Promise\<{ terminus: boolean;
fromInclusiveMiniblockNum: bigint; }\>; } \`\`\`

\# useSendMessage Source:
https://docs.towns.com/build/react-sdk/api/useSendMessage

Hook to send a message to a stream. Can be used to send a message to a
channel or a dm/group dm.

\## Imports

\`\`\`ts theme={null} import { useSendMessage } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useSendMessage( streamId: string,
config?: ActionConfig\<Channel\[\"sendMessage\"\]\>, ): { data: {
eventId: string; } \| undefined; error: Error \| undefined; isPending:
boolean; isSuccess: boolean; isError: boolean; sendMessage: (message:
string, options?: { threadId?: string; replyId?: string; mentions?:
PlainMessage\<ChannelMessage.Post.Mention\>\[\]; attachments?:
PlainMessage\<ChannelMessage.Post.Attachment\>\[\]; appClientAddress?:
string; } \| undefined) =\> Promise\<{ eventId: string; }\>; } \`\`\`

\*\*Source:\*\*
\[useSendMessage\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useSendMessage.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to send the message to.

\### config

\* \*\*Type:\*\* \`ActionConfig\<Channel\[\"sendMessage\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The sendMessage action and the status of the action.

\`\`\`ts theme={null} { data: { eventId: string; } \| undefined; error:
Error \| undefined; isPending: boolean; isSuccess: boolean; isError:
boolean; sendMessage: (message: string, options?: { threadId?: string;
replyId?: string; mentions?:
PlainMessage\<ChannelMessage.Post.Mention\>\[\]; attachments?:
PlainMessage\<ChannelMessage.Post.Attachment\>\[\]; appClientAddress?:
string; } \| undefined) =\> Promise\<{ eventId: string; }\>; } \`\`\`

\# useSendReaction Source:
https://docs.towns.com/build/react-sdk/api/useSendReaction

Hook to send a reaction to a message in a stream.

Reaction can be any string value, including emojis.

\## Imports

\`\`\`ts theme={null} import { useSendReaction } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Examples

\`\`\`ts theme={null} import { useSendReaction } from
\'@towns-protocol/react-sdk\'

const { sendReaction } = useSendReaction(\'stream-id\')
sendReaction(messageEventId, \'🔥\') \`\`\`

\## Definition

\`\`\`ts theme={null} function useSendReaction( streamId: string,
config?: ActionConfig\<Channel\[\"sendReaction\"\]\>, ): { data: {
eventId: string; } \| undefined; error: Error \| undefined; isPending:
boolean; isSuccess: boolean; isError: boolean; sendReaction:
(refEventId: string, reaction: string) =\> Promise\<{ eventId: string;
}\>; } \`\`\`

\*\*Source:\*\*
\[useSendReaction\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useSendReaction.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to send the reaction to.

\### config

\* \*\*Type:\*\* \`ActionConfig\<Channel\[\"sendReaction\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`sendReaction\` action and its loading state.

\`\`\`ts theme={null} { data: { eventId: string; } \| undefined; error:
Error \| undefined; isPending: boolean; isSuccess: boolean; isError:
boolean; sendReaction: (refEventId: string, reaction: string) =\>
Promise\<{ eventId: string; }\>; } \`\`\`

\# useSetDisplayName Source:
https://docs.towns.com/build/react-sdk/api/useSetDisplayName

Hook to set the display name of the current user in a stream.

\## Imports

\`\`\`ts theme={null} import { useSetDisplayName } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useSetDisplayName( streamId: string,
config?: ActionConfig\<Myself\[\"setDisplayName\"\]\>, ): { data: void
\| undefined; error: Error \| undefined; isPending: boolean; isSuccess:
boolean; isError: boolean; setDisplayName: (displayName: string) =\>
Promise\<void\>; } \`\`\`

\*\*Source:\*\*
\[useSetDisplayName\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useMyMember.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to set the display name of.

\### config

\* \*\*Type:\*\* \`ActionConfig\<Myself\[\"setDisplayName\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`setDisplayName\` action and its loading state.

\`\`\`ts theme={null} { data: void \| undefined; error: Error \|
undefined; isPending: boolean; isSuccess: boolean; isError: boolean;
setDisplayName: (displayName: string) =\> Promise\<void\>; } \`\`\`

\# useSetEnsAddress Source:
https://docs.towns.com/build/react-sdk/api/useSetEnsAddress

Hook to set the ENS address of the current user in a stream. You should
be validating if the ENS address belongs to the user before setting it.

\## Imports

\`\`\`ts theme={null} import { useSetEnsAddress } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useSetEnsAddress( streamId: string,
config?: ActionConfig\<Myself\[\"setEnsAddress\"\]\>, ): { data: void \|
undefined; error: Error \| undefined; isPending: boolean; isSuccess:
boolean; isError: boolean; setEnsAddress: (ensAddress: \`0x\${string}\`)
=\> Promise\<void\>; } \`\`\`

\*\*Source:\*\*
\[useSetEnsAddress\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useMyMember.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to set the ENS address of.

\### config

\* \*\*Type:\*\* \`ActionConfig\<Myself\[\"setEnsAddress\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`setEnsAddress\` action and its loading state.

\`\`\`ts theme={null} { data: void \| undefined; error: Error \|
undefined; isPending: boolean; isSuccess: boolean; isError: boolean;
setEnsAddress: (ensAddress: \`0x\${string}\`) =\> Promise\<void\>; }
\`\`\`

\# useSetNft Source:
https://docs.towns.com/build/react-sdk/api/useSetNft

Hook to set the NFT of the current user in a stream. You should be
validating if the NFT belongs to the user before setting it.

\## Imports

\`\`\`ts theme={null} import { useSetNft } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useSetNft( streamId: string, config?:
ActionConfig\<Myself\[\"setNft\"\]\>, ): { data: void \| undefined;
error: Error \| undefined; isPending: boolean; isSuccess: boolean;
isError: boolean; setNft: (nft: NftModel) =\> Promise\<void\>; } \`\`\`

\*\*Source:\*\*
\[useSetNft\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useMyMember.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to set the NFT of.

\### config

\* \*\*Type:\*\* \`ActionConfig\<Myself\[\"setNft\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`setNft\` action and its loading state.

\`\`\`ts theme={null} { data: void \| undefined; error: Error \|
undefined; isPending: boolean; isSuccess: boolean; isError: boolean;
setNft: (nft: NftModel) =\> Promise\<void\>; } \`\`\`

\# useSetUsername Source:
https://docs.towns.com/build/react-sdk/api/useSetUsername

Hook to set the username of the current user in a stream.

\## Imports

\`\`\`ts theme={null} import { useSetUsername } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useSetUsername( streamId: string,
config?: ActionConfig\<Myself\[\"setUsername\"\]\>, ): { data: void \|
undefined; error: Error \| undefined; isPending: boolean; isSuccess:
boolean; isError: boolean; setUsername: (username: string) =\>
Promise\<void\>; } \`\`\`

\*\*Source:\*\*
\[useSetUsername\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useMyMember.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to set the username of.

\### config

\* \*\*Type:\*\* \`ActionConfig\<Myself\[\"setUsername\"\]\>\` \*
\*\*Optional\*\*

Configuration options for the action.

\## Return Type

The \`setUsername\` action and its loading state.

\`\`\`ts theme={null} { data: void \| undefined; error: Error \|
undefined; isPending: boolean; isSuccess: boolean; isError: boolean;
setUsername: (username: string) =\> Promise\<void\>; } \`\`\`

\# useSpace Source: https://docs.towns.com/build/react-sdk/api/useSpace

Hook to get data about a space. You can use this hook to get space
metadata and ids of channels in the space.

\## Imports

\`\`\`ts theme={null} import { useSpace } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Examples

You can use this hook to display the data about a space:

\`\`\`tsx theme={null} import { useSpace } from
\'@towns-protocol/react-sdk\'

const Space = ({ spaceId }: { spaceId: string }) =\> { const { data:
space } = useSpace(spaceId) return \<div\>{space.metadata?.name \|\|
\'Unnamed Space\'}\</div\> } \`\`\`

\## Definition

\`\`\`ts theme={null} function useSpace( spaceId: string, config?:
ObservableConfig.FromObservable\<Space\>, ):
ObservableValue\<SpaceModel\> \`\`\`

\*\*Source:\*\*
\[useSpace\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useSpace.ts)

\## Parameters

\### spaceId

\* \*\*Type:\*\* \`string\`

The id of the space to get data about.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromObservable\<Space\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The SpaceModel data.

\`\`\`ts theme={null} ObservableValue\<SpaceModel\> \`\`\`

\# useSyncAgent Source:
https://docs.towns.com/build/react-sdk/api/useSyncAgent

Hook to get the sync agent from the TownsSyncProvider.

You can use it to interact with the sync agent for more advanced usage.

Throws an error if no sync agent is set in the TownsSyncProvider.

\## Imports

\`\`\`ts theme={null} import { useSyncAgent } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useSyncAgent(): SyncAgent \`\`\`

\*\*Source:\*\*
\[useSyncAgent\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useSyncAgent.tsx)

\## Return Type

The sync agent in use, set in TownsSyncProvider.

\`\`\`ts theme={null} SyncAgent \`\`\`

\# useThreads Source:
https://docs.towns.com/build/react-sdk/api/useThreads

Hook to get the threads from a stream.

\## Imports

\`\`\`ts theme={null} import { useThreads } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useThreads( streamId: string, config?:
ObservableConfig.FromObservable\<TimelinesMap\>, ):
ObservableValue\<TimelinesMap\> \`\`\`

\*\*Source:\*\*
\[useThreads\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useThreads.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to get the threads from.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromObservable\<TimelinesMap\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The threads of the stream as a map from the message eventId to a thread.

\`\`\`ts theme={null} ObservableValue\<TimelinesMap\> \`\`\`

\# useTimeline Source:
https://docs.towns.com/build/react-sdk/api/useTimeline

Hook to get the timeline events from a stream.

You can use the \`useTimeline\` hook to get the timeline events from a
channel stream, dm stream or group dm stream

\## Imports

\`\`\`ts theme={null} import { useTimeline } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Examples

\`\`\`ts theme={null} import { useTimeline } from
\'@towns-protocol/react-sdk\' import { RiverTimelineEvent } from
\'@towns-protocol/sdk\'

const { data: events } = useTimeline(streamId)

// You can filter the events by their kind const messages =
events.filter((event) =\> event.content?.kind ===
RiverTimelineEvent.ChannelMessage) \`\`\`

\## Definition

\`\`\`ts theme={null} function useTimeline( streamId: string, config?:
ObservableConfig.FromObservable\<TimelineEvent\[\]\>, ):
ObservableValue\<TimelineEvent\[\]\> \`\`\`

\*\*Source:\*\*
\[useTimeline\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useTimeline.ts)

\## Parameters

\### streamId

\* \*\*Type:\*\* \`string\`

The id of the stream to get the timeline events from.

\### config

\* \*\*Type:\*\*
\`ObservableConfig.FromObservable\<TimelineEvent\[\]\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The timeline events of the stream as an observable.

\`\`\`ts theme={null} ObservableValue\<TimelineEvent\[\]\> \`\`\`

\# useTowns Source: https://docs.towns.com/build/react-sdk/api/useTowns

Hook to get an observable from the sync agent.

An alternative of our premade hooks, allowing the creation of custom
abstractions.

\## Imports

\`\`\`ts theme={null} import { useTowns } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useTowns\<T\>( selector: (sync:
SyncSelector) =\> Observable\<T\>, config?:
ObservableConfig.FromData\<T\>, ): ObservableValue\<T extends
PersistedModel\<infer UnwrappedData\> ? UnwrappedData : T\> \`\`\`

\*\*Source:\*\*
\[useTowns\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useTowns.ts)

\## Parameters

\### selector

\* \*\*Type:\*\* \`(sync: SyncSelector) =\> Observable\<T\>\`

A selector function to get a observable from the sync agent.

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromData\<T\>\` \* \*\*Optional\*\*

Configuration options for the observable.

\#### config.fireImmediately

\* \*\*Type:\*\* \`boolean\` \* \*\*Optional\*\*

Trigger the update immediately, without waiting for the first update.

\#### config.onError

\* \*\*Type:\*\* \`(error: Error) =\> void\` \* \*\*Optional\*\*

Callback function to be called when an error occurs.

\#### config.onUpdate

\* \*\*Type:\*\* \`(data: Data) =\> void\` \* \*\*Optional\*\*

Callback function to be called when the data is updated.

\## Return Type

The data from the selected observable.

\`\`\`ts theme={null} ObservableValue\<T extends PersistedModel\<infer
UnwrappedData\> ? UnwrappedData : T\> \`\`\`

\# useTownsAuthStatus Source:
https://docs.towns.com/build/react-sdk/api/useTownsAuthStatus

Hook to get the auth status of the user connection with the Towns
network.

\## Imports

\`\`\`ts theme={null} import { useTownsAuthStatus } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Definition

\`\`\`ts theme={null} function useTownsAuthStatus( config?:
ObservableConfig.FromObservable\<AuthStatus\>, ): { status: AuthStatus;
isInitializing: boolean; isEvaluatingCredentials: boolean;
isCredentialed: boolean; isConnectingToTowns: boolean;
isConnectedToTowns: boolean; isDisconnected: boolean; isError: boolean;
} \`\`\`

\*\*Source:\*\*
\[useTownsAuthStatus\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useTownsAuthStatus.ts)

\## Parameters

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromObservable\<AuthStatus\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

An object containing the current AuthStatus status and boolean flags for
each possible status.

\`\`\`ts theme={null} { status: AuthStatus; isInitializing: boolean;
isEvaluatingCredentials: boolean; isCredentialed: boolean;
isConnectingToTowns: boolean; isConnectedToTowns: boolean;
isDisconnected: boolean; isError: boolean; } \`\`\`

\# useUserDms Source:
https://docs.towns.com/build/react-sdk/api/useUserDms

Hook to get the direct messages of the current user.

\## Imports

\`\`\`ts theme={null} import { useUserDms } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Examples

You can combine this hook with the \`useDm\`, \`useMemberList\` and
\`useMember\` hooks to get all direct messages of the current user and
render them, showing the name of the other user in the dm:

\`\`\`tsx theme={null} import { useDm, useMyMember, useMemberList,
useMember } from \'@towns-protocol/react-sdk\'

const AllDms = () =\> { const { streamIds } = useUserDms() return
\<\>{streamIds.map((streamId) =\> \<Dm key={streamId}
streamId={streamId} /\>)}\</\> }

const Dm = ({ streamId }: { streamId: string }) =\> { const { data: dm }
= useDm(streamId) const { userId: myUserId } = useMyMember(streamId)
const { data: members } = useMemberList(streamId) const { userId,
username, displayName } = useMember({ streamId, // We find the other
user in the dm by checking the userIds in the member list // and
defaulting to the current user if we don\'t find one, since a user is
able to send a dm to themselves userId: members.userIds.find((userId)
=\> userId !== sync.userId) \|\| sync.userId, }) return \<span\>{userId
=== myUserId ? \'You\' : displayName \|\| username \|\| userId}\</span\>
} \`\`\`

\## Definition

\`\`\`ts theme={null} function useUserDms( config?:
ObservableConfig.FromObservable\<Dms\>, ): { error: Error \| undefined;
status: \"loading\" \| \"loaded\" \| \"error\"; isLoading: boolean;
isError: boolean; isLoaded: boolean; streamIds: string\[\]; } \`\`\`

\*\*Source:\*\*
\[useUserDms\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useUserDms.ts)

\## Parameters

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromObservable\<Dms\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The list of all direct messages stream ids of the current user.

\`\`\`ts theme={null} { error: Error \| undefined; status: \"loading\"
\| \"loaded\" \| \"error\"; isLoading: boolean; isError: boolean;
isLoaded: boolean; streamIds: string\[\]; } \`\`\`

\# useUserGdms Source:
https://docs.towns.com/build/react-sdk/api/useUserGdms

Hook to get the group dm streams of the current user.

\## Imports

\`\`\`ts theme={null} import { useUserGdms } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Examples

You can combine this hook with the \`useGdm\` hook to get all group dm
streams of the current user and render them:

\`\`\`tsx theme={null} import { useUserGdms, useGdm } from
\'@towns-protocol/react-sdk\'

const AllGdms = () =\> { const { streamIds } = useUserGdms() return
\<\>{streamIds.map((streamId) =\> \<Gdm key={streamId}
streamId={streamId} /\>)}\</\> }

const Gdm = ({ streamId }: { streamId: string }) =\> { const { data: gdm
} = useGdm(streamId) return \<div\>{gdm.metadata?.name \|\| \'Unnamed
Gdm\'}\</div\> } \`\`\`

\## Definition

\`\`\`ts theme={null} function useUserGdms( config?:
ObservableConfig.FromObservable\<Gdms\>, ): { error: Error \| undefined;
status: \"loading\" \| \"loaded\" \| \"error\"; isLoading: boolean;
isError: boolean; isLoaded: boolean; streamIds: string\[\]; } \`\`\`

\*\*Source:\*\*
\[useUserGdms\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useUserGdms.ts)

\## Parameters

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromObservable\<Gdms\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The list of all group dm stream ids of the current user.

\`\`\`ts theme={null} { error: Error \| undefined; status: \"loading\"
\| \"loaded\" \| \"error\"; isLoading: boolean; isError: boolean;
isLoaded: boolean; streamIds: string\[\]; } \`\`\`

\# useUserSpaces Source:
https://docs.towns.com/build/react-sdk/api/useUserSpaces

Hook to get the spaces of the current user.

\## Imports

\`\`\`ts theme={null} import { useUserSpaces } from
\'@towns-protocol/react-sdk\' \`\`\`

\## Examples

You can combine this hook with the \`useSpace\` hook to get all spaces
of the current user and render them:

\`\`\`tsx theme={null} import { useUserSpaces, useSpace } from
\'@towns-protocol/react-sdk\'

const AllSpaces = () =\> { const { spaceIds } = useUserSpaces() return
\<\>{spaceIds.map((spaceId) =\> \<Space key={spaceId} spaceId={spaceId}
/\>)}\</\> }

const Space = ({ spaceId }: { spaceId: string }) =\> { const { data:
space } = useSpace(spaceId) return \<div\>{space.metadata?.name \|\|
\'Unnamed Space\'}\</div\> } \`\`\`

\## Definition

\`\`\`ts theme={null} function useUserSpaces( config?:
ObservableConfig.FromObservable\<Spaces\>, ): { error: Error \|
undefined; status: \"loading\" \| \"loaded\" \| \"error\"; isLoading:
boolean; isError: boolean; isLoaded: boolean; spaceIds: string\[\]; }
\`\`\`

\*\*Source:\*\*
\[useUserSpaces\](https://github.com/towns-protocol/towns/blob/main/packages/react-sdk/src/useUserSpaces.ts)

\## Parameters

\### config

\* \*\*Type:\*\* \`ObservableConfig.FromObservable\<Spaces\>\` \*
\*\*Optional\*\*

Configuration options for the observable.

\## Return Type

The list of all space ids of the current user.

\`\`\`ts theme={null} { error: Error \| undefined; status: \"loading\"
\| \"loaded\" \| \"error\"; isLoading: boolean; isError: boolean;
isLoaded: boolean; spaceIds: string\[\]; } \`\`\`

\# Changelog Source: https://docs.towns.com/build/react-sdk/changelog

\# Getting Started Source:
https://docs.towns.com/build/react-sdk/getting-started

This guide will help you get started with Towns Protocol React SDK.
You\'ll learn how to:

1\. \[Install the React SDK\](#installation) 2. \[Set up the necessary
providers\](#setting-up-providers) 3. \[Connect to
Towns\](#connecting-to-towns-protocol) 4. \[Create a
space\](#creating-a-space) 5. \[Send your first
message\](#sending-your-first-message)

\## Installation

You can start a new Towns project in two ways:

\### Using create-towns-protocol-app (Recommended)

The easiest way to get started is using \`create-towns-protocol-app\`
and follow the instructions in the terminal. This will set up a new
React project with all the necessary dependencies and configurations.

\`\`\`bash theme={null} \# bun bun create towns-protocol-app my-app

\# npm npm create towns-protocol-app my-app

\# yarn yarn create towns-protocol-app my-app

\# pnpm pnpm create towns-protocol-app my-app \`\`\`

By default, this will create a new app using the Towns Playground
template - a full-featured example application that demonstrates
Towns\'s Protocol capabilities.

\### Manual Installation

If you prefer to add the React SDK to an existing project, install the
required dependencies:

\`\`\`bash theme={null} bun add \@towns-protocol/react-sdk
\@towns-protocol/sdk vite-plugin-node-polyfills \`\`\`

Then, add the \`vite-plugin-node-polyfills\` to your \`vite.config.ts\`:

\`\`\`ts vite.config.ts {1,9} theme={null} import { nodePolyfills } from
\'vite-plugin-node-polyfills\' import { defineConfig } from \'vite\'
import react from \'@vitejs/plugin-react\'

export default defineConfig({ // \...rest of your config plugins: \[ //
\...rest of your plugins nodePolyfills(), react(), \], }) \`\`\`

\## Setting Up Providers

Towns requires a few providers to be set up at the root of your
application:

1\. \`WagmiProvider\` - For Web3 wallet connection (recommended) 2.
\`TownsSyncProvider\` - For interacting with Towns Protocol

Here\'s how to set them up:

\`\`\`tsx App.tsx theme={null} import { TownsSyncProvider } from
\"@towns-protocol/react-sdk\"; import { base, baseSepolia } from
\'viem/chains\' import { WagmiConfig, createConfig } from \"wagmi\";
import { createPublicClient, http } from \'viem\'

// Configure Wagmi export const wagmiConfig = createConfig({
autoConnect: true, publicClient: createPublicClient({ chain: \[base,
baseSepolia\], transport: http() }), })

function App() { return ( \<WagmiConfig config={wagmiConfig}\>
\<TownsSyncProvider\> {/\* Your app content \*/} \</TownsSyncProvider\>
\</WagmiConfig\> ); } \`\`\`

If you need any assistance with setting up Wagmi, check out the \[Wagmi
Getting Started Guide\](https://wagmi.sh/react/getting-started).

\## Connecting to Towns Protocol

You can connect to Towns using either a Web3 wallet (recommended) or a
bearer token.

You can use the following networks:

\* \`omega\` - The Towns mainnet, uses Base as the EVM chain \*
\`gamma\` - The Towns testnet, uses Base Sepolia as the EVM chain

We recommend using \`gamma\` as a starting point.

\<Note\> You can use other gamma clients like \[Towns
(gamma)\](https://app.gamma.towns.com) or the \[Towns
Playground\](https://river-sample-app.vercel.app) to help you inspect
messages on the \`gamma\` network. \</Note\>

\### Using a Web3 Wallet

\`\`\`tsx theme={null} import { useAgentConnection } from
\"@towns-protocol/react-sdk\"; import { townsEnv } from
\"@towns-protocol/sdk\"; import { getEthersSigner } from
\"./utils/viem-to-ethers\"; import { wagmiConfig } from
\"./config/wagmi\";

const townsConfig = townsEnv().makeTownsConfig(\"gamma\");

function ConnectButton() { const { connect, isAgentConnecting,
isAgentConnected } = useAgentConnection();

return ( \<button onClick={async () =\> { const signer = await
getEthersSigner(wagmiConfig); connect(signer, { townsConfig }); }} \>
{isAgentConnecting ? \"Connecting\...\" : \"Connect\"} {isAgentConnected
&& \"Connected ✅\"} \</button\> ); } \`\`\`

\<Note\> You\'ll need to use \`getEthersSigner\` to get the signer from
viem wallet client. Towns SDK uses ethers under the hood, so you\'ll
need to convert the viem wallet client to an ethers signer.

You can get the \`getEthersSigner\` function from \[Wagmi
docs\](https://wagmi.sh/core/guides/ethers#usage-1). \</Note\>

\### Using a Bearer Token

You can connect to Towns using a pre-existing identity. This allows you
to read and send messages, but you won\'t be able to create spaces or
channels (on-chain actions).

\<Note\> If you have a Towns account, you can get your bearer token from
there. Type \`/bearer-token\` in any conversation to get your token.
\</Note\>

\`\`\`tsx theme={null} import { useAgentConnection } from
\"@towns-protocol/react-sdk\"; import { townsEnv } from
\"@towns-protocol/sdk\";

const townsConfig = townsEnv().makeTownsConfig(\"gamma\");

function ConnectButton() { const { connectUsingBearerToken,
isAgentConnecting, isAgentConnected } = useAgentConnection(); const
\[bearerToken, setBearerToken\] = useState(\'\');

return ( \<div\> \<input value={bearerToken} onChange={(e) =\>
setBearerToken(e.target.value)} placeholder=\"Enter bearer token\" /\>
\<button onClick={() =\> connectUsingBearerToken(bearerToken, {
townsConfig })} \> {isAgentConnecting ? \"Connecting\...\" :
\"Connect\"} {isAgentConnected && \"Connected ✅\"} \</button\> \</div\>
); } \`\`\`

\## Creating a Space

Once connected, you can start interacting with Towns. Here\'s how to
create a space:

\<Note\> You can only create a space with a Web3 wallet. If you\'re
using a bearer token, you can\'t create spaces. \</Note\>

\`\`\`tsx theme={null} import { useCreateSpace } from
\"@towns-protocol/react-sdk\"; import { getEthersSigner } from
\"@/utils/viem-to-ethers\"; import { wagmiConfig } from
\"@/config/wagmi\";

function CreateSpace({ onCreateSpace }: { onCreateSpace: (spaceId:
string) =\> void }) { const { createSpace, isPending } =
useCreateSpace(); const \[spaceName, setSpaceName\] = useState(\'\');

return ( \<form onSubmit={async (e) =\> { e.preventDefault(); const
signer = await getEthersSigner(wagmiConfig); const { spaceId } = await
createSpace({ spaceName }, signer); // Let a parent component handle the
spaceId, keep reading the guide! onCreateSpace(spaceId); // Reset form
setSpaceName(\'\'); }} \> \<div\> \<input value={spaceName}
onChange={(e) =\> setSpaceName(e.target.value)} placeholder=\"Space
name\" required /\> \</div\> \<button type=\"submit\"
disabled={isPending}\> {isPending ? \"Creating\...\" : \"Create Space\"}
\</button\> \</form\> ); } \`\`\`

\## Sending Your First Message

With the space created, we can send a message to the \`#general\`
channel. Here\'s how to create a form

\`\`\`tsx theme={null} import { useChannel, useSendMessage, useSpace,
useTimeline, useUserSpaces, } from \'@towns-protocol/react-sdk\' import
{ RiverTimelineEvent } from \'@towns-protocol/sdk\' import { useState }
from \'react\'

// Form to send a message to a channel function ChatInput({ spaceId,
channelId }: { spaceId: string; channelId: string }) { const {
sendMessage, isPending } = useSendMessage(channelId) const { data:
channel } = useChannel(spaceId, channelId) const \[message, setMessage\]
= useState(\'\')

return ( \<form onSubmit={(e) =\> { e.preventDefault()
sendMessage(message) setMessage(\'\') }} \> \<input value={message}
placeholder={\`Type a message in \${channel?.metadata?.name \|\|
\'unnamed channel\'}\`} onChange={(e) =\> setMessage(e.target.value)}
/\> \<button type=\"submit\" disabled={isPending}\> {isPending ?
\'Sending\...\' : \'Send\'} \</button\> \</form\> ) }

// Display messages from a channel function ChatMessages({ channelId }:
{ channelId: string }) { const { data: events } = useTimeline(channelId)
return ( \<div\> {/\* Filter out non-message events \*/} {events
?.filter((event) =\> event.content?.kind ===
RiverTimelineEvent.ChannelMessage) .map((message) =\> ( \<p
key={message.eventId}\> {message.content?.kind ===
RiverTimelineEvent.ChannelMessage ? message.content?.body : \'\'} \</p\>
))} \</div\> ) }

// Chat component that renders the chat input and messages, given a
spaceId function Chat({ spaceId }: { spaceId: string }) { const { data:
space } = useSpace(spaceId) const channelId = space?.channelIds?.\[0\]
// Spaces have a default channel called \`general\`

return ( \<\> {channelId && \<ChatInput spaceId={spaceId}
channelId={channelId} /\>} {channelId && \<ChatMessages
channelId={channelId} /\>} \</\> ) }

// Renders the name of a space const SpaceName = ({ spaceId }: {
spaceId: string }) =\> { const { data: space } = useSpace(spaceId)
return \<\>{space?.metadata?.name}\</\> }

// Chat app that renders the create space and chat components export
const ChatApp = () =\> { // Get the list of spaces we\'re a member of
const { spaceIds } = useUserSpaces() const \[spaceId, setSpaceId\] =
useState(\'\')

return ( \<div\> {/\* Show a list of spaces we\'re a member of, click to
select one \*/} {spaceIds.map((spaceId) =\> ( \<button type=\"button\"
key={spaceId} onClick={() =\> setSpaceId(spaceId)}\> \<SpaceName
spaceId={spaceId} /\> \</button\> ))} {/\* Show the create space form if
we don\'t have a space \*/} {!spaceId && \<CreateSpace
onCreateSpace={(spaceId) =\> setSpaceId(spaceId)} /\>} {/\* Render the
chat component with the current selected space \*/} {spaceId && ( \<h1\>
Chatting in \<SpaceName spaceId={spaceId} /\> \</h1\> )} {spaceId &&
\<Chat spaceId={spaceId} /\>} \</div\> ) } \`\`\`

Add the \`ChatApp\` component to your app and you\'re ready to start
chatting!

\## Next Steps

Now that you have the basics set up, you can:

\* \[Create and join spaces\](/build/react-sdk/api/useCreateSpace) \*
\[Create channels\](/build/react-sdk/api/useCreateChannel) \* \[Send
messages\](/build/react-sdk/api/useSendMessage) \* \[Read
messages\](/build/react-sdk/api/useTimeline) \* \[Send
reactions\](/build/react-sdk/api/useSendReaction) \* \[Set
username\](/build/react-sdk/api/useSetUsername) \* \[Read message
threads\](/build/react-sdk/api/useThreads) \* much more! You can find
the full list of hooks in the \[API Reference\](/build/react-sdk/api).

Check out our \[Playground
template\](https://river-sample-app.vercel.app) for a full-featured
example application.

\# Towns Encryption Protocol Source:
https://docs.towns.com/build/towns-encryption

How the Towns encryption and decryption protocol works.

\### What is the Towns Encryption Protocol?

The Towns protocol supports end-to-end encryption and decryption between
a group of user devices. When a user (Bob) wants to send a new message
to a group of users, Bob\'s device first creates a new group session.
Using the outbound session key, it encrypts the message. Then the
encrypted message is sent to the group.

When a recipient (Alice) gets the encrypted message, her device will
start a new group session to import the inbound session key, and then
use it to decrypt the message.

But how does Alice\'s device gets the inbound session key in the first
place?

The following section describes the inner workings of the group
encryption protocol. It explains how Alice\'s device makes a \*\*\`key
solicitation request\`\*\* to get missing session keys. It also covers
how other devices in the group can \*\*\`share session keys\`\*\* in a
process called \*\*\`key fulfillment\`\*\* after checking that Bob is a
group member.

Before diving into the \`key solicitation\`, \`key fulfillment\`, and
\`key sharing\` algorithms, let\'s first take a look at the core
entities in the group encryption protocol.

\### Core entities in the Towns Encryption Protocol

\*\*\`GroupEncryptionCrypto\`\*\* : The main interface of the protocol.
It initializes the \*\*\`EncryptionDelegate\`\*\*. This class
\"delegates\" the encryption and decryption operations to the \[\`olm\`
library from the Matrix.org
foundation\](https://www.npmjs.com/package/@matrix-org/olm). This
library implements the Double Ratchet algorithm. See notes on
\[supported algorithm\](#supported-algorithm) for future plans.

The Towns Encryption Protocol uses this library to create a group
session, and perform device-to-device encryption using the session keys.

The \`GroupEncryptionCrypto\` creates a \`GroupEncryption\`, a
\`GroupDecryption\`, and an \`EncryptionDevice\` to handle the group
encryption protocol:

\`\`\`mermaid theme={null} \-\-- title: GroupEncryptionCrypto and its
embedded components \-\-- erDiagram GroupEncryptionCrypto \|\|\--\|\|
EncryptionDelegate : \"initializes\" GroupEncryptionCrypto \|\|\--\|\|
EncryptionDevice : \"creates\" GroupEncryptionCrypto \|\|\--\|\|
GroupEncryption : \"creates\" GroupEncryptionCrypto \|\|\--\|\|
GroupDecryption : \"creates\" GroupEncryptionCrypto \|\|\--\|\|
CryptoStore : \"has reference to\" \`\`\`

\* \*\*\`GroupEncryption\`\*\* : handles group encryption using session
keys. Outgoing messages are encrypted with outbound session keys. \*
\*\*\`GroupDecryption\`\*\* : handles group decryption using session
keys. Incoming messages are decrypted with inbound session keys. \*
\*\*\`EncryptionDevice\`\*\* : interfaces with the
\`EncryptionDelegate\` to perform cryptographic operations. It also uses
the \`CryptoStore\` to get and save the inbound / outbound session keys.

\`\`\`mermaid theme={null} erDiagram GroupEncryption \|\|\--\|\|
EncryptionDevice : \"uses for encryption\" GroupDecryption \|\|\--\|\|
EncryptionDevice : \"uses for decryption\" GroupEncryption \|\|\--\|\|
IGroupEncryptionClient : \"uses for key sharing\" EncryptionDevice
\|\|\--\|\| EncryptionDelegate : \"encrypts and decrypts with\"
EncryptionDevice \|\|\--\|\| CryptoStore : \"gets and stores keys in\"
\`\`\`

\### Encrypting a message with GroupEncryption

A device will need an outgoing session to encrypt a message to the
group. If it does not already have a session, it must create one. In
addition, it will also create an inbound session. The inbound session is
encrypted and sent to other devices in the group.

\`\`\`mermaid theme={null} flowchart TB groupEncryption(encrypt) \--\>
outboundSession{\"outbound session exists?\"} outboundSession \-- no
\--\> createOutboundSession(\"create outbound session\")
createOutboundSession \--\> saveOutboundSession(\"save outbound session
in CryptoStore\") outboundSession \-- yes \--\> encrypt(\"encrypt
plaintext with outbound session key\") encrypt \-- returns \--\>
EncryptedData saveOutboundSession \--\> createInboundSession(\"create
inbound session\") createInboundSession \--\> saveInboundSession(\"save
inbound session in CryptoStore\") saveInboundSession \--\>
encryptAndShareInboundSession(\"encrypt and share inbound session with
other devices in group\") encryptAndShareInboundSession \--\> encrypt
\`\`\`

\### Decrypting a message with GroupDecryption

\`\`\`mermaid theme={null} flowchart TB groupDecryption(decrypt) \--\>
inboundSession{\"inbound session exists?\"} inboundSession \-- no \--\>
decryptionError(\"decryption error\") inboundSession \-- yes \--\>
decrypt(\"decrypt ciphertext\") decrypt \-- returns \--\> plaintext
\`\`\`

\### Key solicitation and key fulfillment

If a device does not have any session keys, it can make a
\`KeySolicitation\` request to the group. Any device that is \"online\"
at that moment can share its known session keys, and send a
\`KeyFulfillment\` response to inform others in the group that the
\`KeySolicitation\` request has already been fulfilled.

Continuing our example, suppose Alice\'s device does not have the
session key to decrypt a message from Bob. Alice\'s device posts a
\`KeySolicitation\` request to the stream. Bob\'s device happens to be
online at the moment. When it sees the request, it processes the request
as follows:

\`\`\`mermaid theme={null} flowchart TB onKeySolicitation \--\>
userIsEntitledToStream{\"is user entitled to read from this stream?\"}
userIsEntitledToStream \-- yes \--\> getSessionKeys(\"get session
keys\") userIsEntitledToStream \-- no \--\> stop getSessionKeys \--\>
sendKeyFulfillment(\"send key fulfillment to inform the group that the
key solicitation was handled\") sendKeyFulfillment \--\>
encryptAndShareSession(\"encrypt and share the session keys with the
requester\") \`\`\`

Thus, Alice\'s device is able to get the required session keys for
decryption.

\## Build

See
\[towns-tutorials/encryption-import\](https://github.com/towns-protocol/river-tutorials/blob/main/encryption-import/README.md)
for a tutorial on how to import the Towns Encryption npm package.

\*\*\*

\## Footnotes

\### Supported algorithm

\> The Towns Encryption Protocol is designed to support new algorithms.
There is \> an \`algorithm\` field in the protocol definition. The
current value is \> \`r.group-encryption.v1.aes-sha2\`. This means that
the protocol is using the \> \`olm\` Double Ratchet library for
device-to-device session encryption. \> This field can be set to new
algorithms to support future needs.

\`\`\`protobuf theme={null} // protocol.proto message EncryptedData { //
\... /\*\* \* Encryption algorithm used to encrypt this event. \*/
string algorithm = 2; // \... } \`\`\`

\# Messaging Data Structures Source:
https://docs.towns.com/build/towns-messaging-datastructures

\### Messaging Data Structures

The core application supported by Towns Protocol is messaging. Towns
Stream Nodes are tasked with serving stream events, which are
represented as data using protobufs. Stream events themselves may
contain message-like events or metadata to support event validation.

\### Protocol Messaging Protobuf

The data schema of the Towns protocol can be defined declaratively by
\[protobuf.proto\](https://github.com/towns-protocol/towns/blob/main/protocol/protocol.proto).
Below is an elided snapshot of \`protocol.proto\` as of January 2024
containing only schema definitions used in a messaging context within
the Towns protocol.

\`\`\`proto theme={null} syntax = \"proto3\"; package river; option
go_package = \"github.com/towns-protocol/towns/protocol\";

import \"google/protobuf/timestamp.proto\"; import
\"google/protobuf/empty.proto\";

/\*\* \* StreamEvent is a single event in the stream. \*/ message
StreamEvent { /\*\* \* Address of the creator of the event. \* For
user - address of the user\'s primary wallet. \* For server - address of
the server\'s keypair in staking smart contract. \* \* For the event to
be valid: \* If delegate_sig is present, creator_address must match
delegate_sig. \* If delegate_sig is not present, creator_address must
match event signature in the Envelope. \*/ bytes creator_address = 1;

/\*\* \* delegate_sig allows event to be signed by device keypair \*
which is linked to the user\'s primary wallet. \* \* delegate_sig
contains signature of the public key of the device keypair. \* User\'s
primary wallet is used to produce this signature. \* \* If present, for
the event to be valid: \* 1. creator_address must match delegate_sig\'s
signer public key \* 2. delegate_sig should be the signature of
Envelope.signature\'s public key. \* \* Server nodes sign node-produced
events with their own keypair and do not \* need to use delegate_sig.
\*/ bytes delegate_sig = 2;

/\*\* Salt ensures that similar messages are not hashed to the same
value. genId() from id.ts may be used. \*/ bytes salt = 3;

/\*\* Hash of a preceding miniblock. Null for the inception event. Must
be a recent miniblock \*/ optional bytes prev_miniblock_hash = 4;

/\*\* CreatedAt is the time when the event was created. NOTE: this value
is set by clients and is not reliable for anything other than displaying
the value to the user. Never use this value to sort events from
different users. \*/ int64 created_at_epoch_ms = 5;

/\*\* Variable-type payload. \* Payloads should obey the following
rules: \* - payloads should have their own unique type \* - each payload
should have a oneof content field \* - each payload should have an
inception field inside the content oneof \* - each payload should have a
unique Inception type \* - payloads can\'t violate previous type
recursively to inception payload \*/ oneof payload { MiniblockHeader
miniblock_header = 100; CommonPayload common_payload = 101; SpacePayload
space_payload = 102; ChannelPayload channel_payload = 103; UserPayload
user_payload = 104; UserSettingsPayload user_settings_payload = 105;
UserDeviceKeyPayload user_device_key_payload = 106; UserToDevicePayload
user_to_device_payload = 107; MediaPayload media_payload = 108;
DmChannelPayload dm_channel_payload = 109; GdmChannelPayload
gdm_channel_payload = 110; } }

/\*\* \* SpacePayload \*/ message SpacePayload { message Snapshot { //
inception Inception inception = 1; // streamId: Channel map\<string,
Channel\> channels = 2; // userId: Membership map\<string, Membership\>
memberships = 3; // userId: Username map\<string, WrappedEncryptedData\>
usernames = 4; // userId: Displayname map\<string,
WrappedEncryptedData\> display_names = 5; }

message Inception { string stream_id = 1; StreamSettings settings = 2; }

message Channel { ChannelOp op = 1; string channel_id = 2; EventRef
origin_event = 3; EncryptedData channel_properties = 4; }

oneof content { Inception inception = 1; Channel channel = 2; Membership
membership = 3; EncryptedData username = 4; EncryptedData display_name =
5; } }

/\*\* \* ChannelPayload \*/ message ChannelPayload { message Snapshot {
// inception Inception inception = 1; // userId: Membership map\<string,
Membership\> memberships = 2; }

message Inception { string stream_id = 1; string space_id = 3; /\*\* \*
channel_name and channel_topic from this payload will be used to \*
create associated with that channel space event for stream as we agreed
\* that channel names and topics will be delivered using space stream
\*/ EncryptedData channel_properties = 4; StreamSettings settings = 5; }

oneof content { Inception inception = 1; EncryptedData message = 2;
Membership membership = 3; } }

/\*\* \* DmChannelPayload \*/ message DmChannelPayload { message
Snapshot { Inception inception = 1; map\<string, Membership\>
memberships = 2; map\<string, WrappedEncryptedData\> usernames = 3;
map\<string, WrappedEncryptedData\> display_names = 4; }

message Inception { string stream_id = 1; string first_party_id = 2;
string second_party_id = 3; StreamSettings settings = 4; }

oneof content { Inception inception = 1; Membership membership = 2;
EncryptedData message = 3; EncryptedData username = 4; EncryptedData
display_name = 5; } }

/\*\* \* GdmChannelPayload \*/ message GdmChannelPayload { message
Snapshot { Inception inception = 1; map\<string, Membership\>
memberships = 2; map\<string, WrappedEncryptedData\> usernames = 3;
map\<string, WrappedEncryptedData\> display_names = 4;
WrappedEncryptedData channel_properties = 5; }

message Inception { string stream_id = 1; EncryptedData
channel_properties = 2; StreamSettings settings = 3; }

oneof content { Inception inception = 1; Membership membership = 2;
EncryptedData message = 3; EncryptedData username = 4; EncryptedData
display_name = 5; EncryptedData channel_properties = 6; } }

/\*\* \* MediaPayload \*/ message MediaPayload { message Snapshot {
Inception inception = 1; }

message Inception { string stream_id = 1; string channel_id = 2; int32
chunk_count = 3; StreamSettings settings = 4; }

message Chunk { bytes data = 1; int32 chunk_index = 2; }

oneof content { Inception inception = 1; Chunk chunk = 2; } }

message Membership { MembershipOp op = 1; string user_id = 2; }

message EncryptedData { /\*\* \* Ciphertext of the encryption envelope.
\*/ string ciphertext = 1; /\*\* \* Encryption algorithm used to encrypt
this event. \*/ string algorithm = 2; /\*\* \* Sender device public key
identifying the sender\'s device. \*/ string sender_key = 3; /\*\* \*
The ID of the session used to encrypt the message. \*/ string session_id
= 4;

/\*\* \* Optional checksum of the cleartext data. \*/ optional string
checksum = 5; }

message WrappedEncryptedData { EncryptedData data = 1; int64 event_num =
2; bytes event_hash = 3; }

enum MembershipOp { SO_UNSPECIFIED = 0; SO_INVITE = 1; SO_JOIN = 2;
SO_LEAVE = 3; }

enum ChannelOp { CO_UNSPECIFIED = 0; CO_CREATED = 1; CO_DELETED = 2;
CO_UPDATED = 4; } \`\`\`

\#### SpacePayload

\`StreamEvent\` messages encapsulate all message types handled by Towns
Nodes. The primary unit of account for messaging is described in
\`SpacePayload\`. A newly minted Space is represented on-chain with the
SpaceFactory contract as well of in Towns Nodes and the Towns Chain,
which stores the \`streamId\` of the Space.

There exists a 1-to-many relation between Spaces as defined in data by
the \`SpacePayload\` message and \`Channels\`. Furthermore,
\`Memberships\`, \`usernames\`, and \`display_names\` are stored and
snapshotted within the \`streamId\` of a Space.

\`SpacePayload\` is made polymorphic using \`oneof\` in the above
definition. Towns Nodes apply rules to each message after unpacking the
\`payload\` field from the \`StreamEvent\`, which is the message
transmitted to the Towns Node over the wire. These rules validate the
legality of the \`event\` for writes that \`addEvent\` to the stream.

\### Channel messages

Channel messages are the primary messages used to facilitate group chat
within Spaces. They are defined in \`ChannelPayload\` in
\`protocol.proto\`. Each \`ChannelPayload\` message is typed as
\`EncryptedData\`, which is a message that defines the payload of
ciphertext.

\> Remember, Towns nodes never see plain text of messages. The protocol
defines any message-like event or event that requires encryption with an
\`EncryptedData\` or \`WrappedEncryptedData\` message type in
\`protocol.proto\`.

\### DM Channel messages

Direct messages are the second messaging primitive supported by the
Towns protocol. The data structure representing direct messaging is
defined by the \`DmChannelPayload\` protobuf. Each DM is created with
the pair of users privy to the DM conversation. Note that just like with
channel messages, DM\'s are \`EncryptedData\` messages from the node\'s
vantage point.

\### GDM Channel messages

Group direct message messages are supported by the Towns protocol as
their own streams as well. Each Group DM is created with the list of
members that forms the initial Membership roster. Though outside the
specification of the protocol, the membership roster is meant to convey
entitlement to encryption keys, such that clients can implement logic to
share keys only with members of the same group dm.

\> DM\'s, and GDM\'s are all created as new streams in the Towns Node
using the \`createStream\` rpc client method. Unlike Spaces and Channels
though, there exists no on-chain record of these streams.

\### Media messages

Media files are supported as separate streams in Towns protocol
associated with a parent \`channel_id\`. Messages added to a Towns node
containing media must pass validation criteria that proves the
\`creator\` is a member of that \`channel_id\` to prevent
man-in-the-middle type attacks.

Media files can be quite large in size and as such are chunked in byte
arrays on nodes and therefore support pagination by clients.

\# Chunk Management Source:
https://docs.towns.com/concepts/chunk-management

In distributed systems, managing resource allocation efficiently is
crucial to prevent certain nodes from becoming overburdened. This is
particularly important in the context of stream processing.

To mitigate the issue of hotspots, where some nodes are overloaded with
highly active streams while others handle less active streams, a
strategy of breaking streams into chunks is proposed. The idea is that
once a chunk of a stream reaches a predetermined size, it is then handed
over to a new set of nodes.

This approach, which is not part of the initial implementation but is on
the immediate roadmap, ensures a more balanced distribution of
processing load across the nodes.

Additionally, these chunks would maintain the same replication factor,
which is currently set at five, as is the case with entire streams in
the current system. This method aims to optimize resource utilization
and enhance the overall efficiency of the distributed system.

\# Cross Chain Entitlements Source:
https://docs.towns.com/concepts/cross-chain-entitlement-checking

\## Overview

Cross Chain Entitlement Checking is a key feature in Towns Protocol,
enabling the verification of entitlements that are stored on blockchains
other than Base. Initially this set is restricted to other EVM chains
Ethereum Mainnet, Optimism, Arbitrum, and Polygon. Other chains are
planned to be added in the future.

\## Use Cases

1\. \*\*Asset Requirements Across Chains:\*\* For instance, a Space
might necessitate members to hold a Crypto Punk on Ethereum Mainnet and
a Degod on Polygon. 2. \*\*Asset Quantity Requirements:\*\* Another
example could be a Space that allows entry only to users who possess
over 5 ETH across their linked wallets.

\## Entitlement Checks for Permissions

Cross Chain Entitlement Checks can be utilized for specific permissions
such as Read, Write, or Mint. However, it\'s important to note that
permissions requiring direct contract transactions, like channel
creation or role assignment, must rely solely on entitlements based on
assets stored on the Base Chain.

\### Process for Minting a Member NFT

1\. \*\*Join Request:\*\* A user initiates a request to join a Space
through the smart contract. 2. \*\*Membership Fee Verification:\*\* The
contract verifies whether the user has paid the necessary membership
fee, if applicable. 3. \*\*Cross-Chain Requirement Assessment:\*\* The
contract determines if joining the Space requires a cross-chain
entitlement check. 4. \*\*Broadcasting the Request:\*\* If a cross-chain
check is needed, the request is broadcast as an event from the smart
contract, targeting a randomly selected NodeID from the active nodes in
the node registry. 5. \*\*Node Processing:\*\* The designated node picks
up the request and retrieves the entry requirements for the Space, which
are defined in the contract. 6. \*\*Wallet Link and Evaluation:\*\* The
node accesses all linked wallets of the user and assesses if the user
fulfills the Space\'s entry criteria. 7. \*\*Minting Member NFT:\*\*
Upon successful verification, the node sends a positive response back to
the smart contract, triggering the automatic minting of the Member NFT
for that Space to the user\'s address.

\# Encryption Source: https://docs.towns.com/concepts/encryption

End-to-End Message Encryption

All messages in the context of the communication modalities that Towns
Protocol supports are encrypted. Nodes are only privy to ciphertext and
clients manage their device encryption keys.

Two related cryptographic ratcheting algorithms are used by Towns to
encrypt messages. Towns employs an implementation of the \[Double
Ratchet\](https://signal.org/docs/specifications/doubleratchet/)
cryptographic ratchet described by Signal to encrypt peer to peer
messages. Towns also employs an AES-based cryptographic ratched
optimized for group messaging.

\## Devices

To facilitate end to end encryption in Towns, each \`(user, client
instance)\` tuple is associated with a \`deviceId\`, which identifies
that device and is used to establish peer-to-peer encrypted sessions for
the purpose of sharing group message encryption keys.

Devices are objects storing key material created on the client and
stored in the Towns Node on the user\'s \`UserDeviceKey\` stream
containing the following pair of keys:

1\. \*\*Curve25519 peer-to-peer encryption key\*\* - A long-lived
Curve25519 asymmetric key pair is created with a new device of a user.
The private portion of this key never leaves the device, while the
public portion is stored in the user\'s \`UserDeviceKey\` stream. This
key along with the following key are used by other user\'s to establish
secure and ephemeral p2p sessions. 2. \*\*Curve25519 fallback key\*\* -
A second Curve25519 key pair is created using the encryption key and
published to a user\'s UserDeviceKey stream. For Alice to establish a
new secure p2p encrypted session with Bob, Alice would use her
encryption key along with Bob\'s public key portion of his encryption
key and fallback key.

\> Device lifecycle is outside of the purview of the Towns protocol and
managed entirely by client implementations. However, given it is
expected under the protocol that there exists a 1-1 relation between
\`(user, client instance)\` tuples and \`devices\`, the Towns Node
performs periodic compaction criteria to stem the uncontrolled growth of
user\'s device key stream in storage.

\## Encryption Data Schemas

Encrypted data originating from messages or metadata, such as usernames,
is described in the protocol with a protobuf message as follows.

\`\`\`protobuf theme={null} message EncryptedData { /\*\* \* Ciphertext
of the encryption envelope. \*/ string ciphertext = 1; /\*\* \*
Encryption algorithm used to encrypt this event. \*/ string algorithm =
2; /\*\* \* Sender device public key identifying the sender\'s device.
\*/ string sender_key = 3; /\*\* \* The ID of the session used to
encrypt the message. \*/ string session_id = 4;

/\*\* \* Optional checksum of the cleartext data. \*/ optional string
checksum = 5; } \`\`\`

The \`session_id\` is used to identify the keys associated with the
ciphertext, which can be used to decrypt the same message multiple
times. This is particularly useful in a group messaging application as
it avoids the need to re-establish peer-to-peer encrypted sessions for
each message.

Peer to peer encryption sessions are only used to transmit session keys
corresponding to message events and are described by the following
protobuf in the protocol.

\`\`\`protobuf theme={null} message GroupEncryptionSessions { string
stream_id = 1; string sender_key = 2; repeated string session_ids = 3;
// deviceKey: per device ciphertext of encrypted session keys that match
session_ids map\<string, string\> ciphertexts = 4; } \`\`\`

A map is used to index ciphertext by the intended user\'s deviceKey
since peer-to-peer encrypted payloads are only able to be decrypted by
the deviceKey that the \`outbound\` sender\'s session was created for.
In general, peer-to-peer encrypted messages are encrypted in a per
device basis.

\## Encryption Lifecycle

Below is an example of the encryption lifecycle between Alice and Bob
who are co-members of a channel within a space.

1\. Alice logs in to her client, creates a new \`device\`, and joins a
Space. 2. Bob who is already logged in and a member of the Space sees a
\`KeySolicitation\` message with a \`device_key\` corresponding to
Alice\'s device. 3. Bob validates that Alice \`isEntitled\` to
decryption keys for the channel stream that the solicitation event
appeared in and creates a new p2p encrypted \`outbound\` session using
Alice\'s device key and fallback key to transmit the keys requested from
his local cache. 4. Bob sends an \`ack\` to the stream to notify other
co-members of the channel that Alice\'s request is being worked on. 5.
Alice sees Bob\'s message on her \`UserToDevice\` key stream and created
a new \`inbound\` session with Bob\'s device key and fallback key
obtained from his \`UserDeviceKey\` stream. 6. Alice decrypts Bob\'s
message and extracts the key material storing it in her local cache. 7.
Alice attempts re-decrypting the channel messages that share the
\`session_id\` of the keys she now has in her possession.

\> Peer-to-peer encryption in Towns requires distinct sessions
\`outbound\`, \`inbound\` for encryption and decryption, respectively.
Moreover, each message can only be decrypted once per established
session.

\## Key Sharing

\### Active Sharing

Session keys to encrypt message events and metadata in Towns are created
on an as-needed basis by clients. If a user is joining a channel and
decides to subsequently send a message for the first time, they will
create a new outbound session key to encrypt the message and send it to
the member roster of the channel along with the message. The same key
can be used as an inbound session key by other members to decrypt the
message encrypted with that session.

\### Passive Sharing

The above contrasts with passive key sharing, which is used to transmit
keys that users are entitled to but do not have locally. When joining a
channel for the first time, a user will sync stream events, but will
need session keys to decrypt message events. The protocol supports an
efficient key sharing scheme that has users place an \`KeySolicitation\`
event on the stream, which any online member of the stream will see and
conditionally service if the solicitator is an entitled member of the
stream.

\### Data

The protocol allows for any stream to support key sharing by way of
\`KeySolicitation\`, and \`KeyFulfillment\` messages. Since fulfilling a
solicitation requires creating a peer-to-peer encrypted session with the
solicitator, the \`device_key\` and \`fallback_key\` are added to the
payload to save a lookup against the \`UserDeviceKey\` stream.
Fulfillments are synced by members of the same stream to avoid the worst
case behavior of every member fulfilling every request in a duplicative
manner.

\`\`\`protobuf theme={null}

message KeySolicitation { string device_key = 1; // requesters
device_key string fallback_key = 2; // requesters fallback_key bool
is_new_device = 3; // true if this is a new device, session_ids will be
empty repeated string session_ids = 4; }

message KeyFulfillment { string user_id = 1; string device_key = 2;
repeated string session_ids = 3; } \`\`\`

\# Mini Blocks Source: https://docs.towns.com/concepts/mini-blocks

\# Mini Block Production

Similar to traditional blockchain building, mini blocks are used to
ensure data integrity and achieve consensus for the ordering of valid
events in a given stream. The following is a detailed description of
each step in the process:

1\. \*\*Election of Responsible Node\*\*: A responsible node is elected
to construct the mini block. This election is based on the block number
and incorporates an element of randomness, utilizing \`randdao\`.

2\. \*\*Initiation of Voting Process\*\*: The elected leader initiates a
voting process. In this stage, each participating node contributes by
sending hashes of the events present in their mini-pool.

3\. \*\*Combination of Votes\*\*: The leader combines these votes and
selects events that are present in the majority of the mini-pools.

4\. \*\*Authority of the Leader\*\*: The leader has the discretion to
determine the order of events within the mini block.

5\. \*\*Formation of Mini Block\*\*: The events chosen are then combined
to form the mini block.

6\. \*\*Mini Block Header Creation\*\*: A header for the mini block is
generated and subsequently signed by the responsible node.

7\. \*\*Integration into Towns Chain\*\*: This mini block header is then
integrated into the Towns chain and disseminated to all participating
nodes.

8\. \*\*Request for Missing Events\*\*: If a node does not possess all
the events in the newly received mini block, it must proactively request
these missing events from other participating nodes.

9\. \*\*Local Storage Update\*\*: Participating nodes update their local
storage to reflect the new mini block. They also remove old mini-pools
that were included in that mini block.

10\. \*\*Formation of New Mini-Pool\*\*: Events not included in the
current mini block form the basis of a new mini-pool for the next
generation.

11\. \*\*Event Effectuation at Block Boundaries\*\*: Certain events,
such as joins and leaves, are only effectuated at block boundaries. This
is to maintain consistent ordering across the network.

This procedure ensures a transparent and efficient process for mini
block production, critical to the stability and reliability of the
protocol.

\## Active Minipool Reconciliation

The system is designed to actively propagate events across stream nodes.
Once a valid event reaches a majority of nodes, it is virtually
guaranteed to end up in the block. Therefore, during an
StreamService.AddEvent operation, the event is actively forwarded to
other stream nodes. If a stream node notices that it lacks an event
referenced in a NodeToNode.NewEventInPool message, it proactively
attempts to fetch it from the node that sent this message.

A node actively fetches missing events if one of the following
conditions occurs:

The hash of an event is received through the NodeToNode.NewEventInPool
RPC, but the NodeToNode.NewEventReceived RPC for the same hash is not
received after a short delay.

A miniblock header is received that contains hashes of events missing
from the local minipool.

Once such an event is fetched from the node containing it, the
NodeToNode.NewEventReceived server-side workflow is executed.

\# Network Partitioning Source:
https://docs.towns.com/concepts/network-partitioning

In the event of complete network partitioning, where the majority of
nodes reside in a single partition, the stream will continue to grow and
blocks will be produced.

Nodes in the minority partition will stall. As a potential future
upgrade, a feature could be developed to avoid stalling nodes.

In the case of partial partitioning, where some stream nodes do not see
other nodes in the group serving the same stream, but a connected path
among all nodes still exists, the stream will continue to progress as
normal due to active minipool reconciliation. That is, nodes will
actively fetch events when they observe a \`NodeToNode.NewEventInPool\`
operation with an unknown hash.

\# Node to Node communication Source:
https://docs.towns.com/concepts/node-node-communication

\## How it works

Nodes communicate with each other using the \`NodeToNode\` service
defined in the
\[protocol\](https://github.com/towns-protocol/towns/blob/main/protocol/internode.proto).

The envelope is received through the \`NodeToNode.NewEventReceived\` RPC
from the node that is processing the \`StreamService.AddEvent\` client
RPC request. The node verifies if the action is permitted, by validating
the signature of the event. The event is then added to the minipool of
the stream and committed to local storage. A success response is sent to
the \`NodeToNode.NewEventReceived\` RPC. A \`NodeToNode.NewEventInPool\`
message, containing the event hash, is broadcast to the stream node,
excluding the original \`NodeToNode.NewEventReceived\` RPC caller.

Once a majority of minipools contain the event, the event is sent to any
client monitoring the given stream through a Sync RPC call.

\* The number of minipools is calculated by counting the local minipool
and the number of \`NodeToNode.NewEventInPool\` messages received.

\# Rebalancing Source: https://docs.towns.com/concepts/rebalancing

In distributed systems, rebalancing is a critical process required to
prevent specific nodes from being overloaded. This need arises
particularly when nodes join or leave the network. It\'s crucial to
differentiate between a node crash exiting and a node cleanly exiting,
as these scenarios necessitate distinct responses.

When a node exits a distributed system, it is essential to have a signal
and corresponding logic to determine how to rebalance the network. The
rebalance logic can be incorporated into a smart contract. However,
generating a signal in a decentralized system is more challenging.
Currently, there\'s ongoing research exploring methods for the protocol
to autonomously detect crash exits through communication with other
nodes. This approach aims to create a fully decentralized solution.

In the interim, a hybrid process is being utilized. This process
involves \'watchers\' that are part of the Towns DAO. These watchers are
responsible for monitoring the system and providing signals to initiate
rebalancing when a node crashes or exits unexpectedly. This hybrid
approach serves as a transitional solution while more autonomous and
decentralized methods are being developed and refined.

\# Snapshotting Source: https://docs.towns.com/concepts/snapshotting

\### Event Ordering

Towns nodes are responsible for assembling events from the stream\'s
\`minipool\` into \`miniblocks\` that are sealed blocks of event hashes
pointing to the previous block hash.

Coarse ordering of events in a given stream is achieved due to the
sequential nature of block production. However, for certain events, such
as a stream\'s membership roster, strict ordering is required.

As a concrete example, take the case where Alice \`joins\` a space at
local time \`t1\` then \`leaves\` the space at time \`t2\`. We should
expect a read of the membership roster after the \`leave\` event to
exclude Alice. We should also expect Alice to have been a member in the
coarse grained time interval \`t2 - t1\` between when the \`join\` and
\`leave\` events were included by a node each in a mini-block. Since
different Towns Nodes may have seen the \`join\` and \`leave\` events,
there is no way to guarrantee that they would be included in mini-blocks
with a temporal sequence equivalent to the sequence in which the actions
were taken.

Therefore, to achieve strict ordering under the Towns protocol a
technique called \*\*Snapshotting\*\* is undertaken at the block
boundary for each stream. A positive side effect of Snapshotting is that
disk utilisation is reduced for nodes as snapshots are updated in-place.

\### Snapshot Production

Snapshots are taken every N events at the block boundary, which occurs
when a node that is elected by \`RANDDAO\` to propose the next block
creates and appends a new signed \`miniblock\` to the stream\'s
\`minichain\`.

\> Though miniblocks are comprised of event hashes, snapshot data is
stored unhashed in miniblock to allow for fast client syncs of \`state\`
events from miniblock which is rolled up onto Towns Chain.

\<img alt=\"Snapshotting\" /\>

\### Data Schema

Each payload type described in the protocol may be subject to
snapshotting. Nodes stand ready to snapshot events for streams they are
assigned to when they are elected as block proposers. Clients can be
assured of strict ordering of \`state\` events and other events that
would benefit from strict ordering at the block boundary and data
compaction.

Typically, \`maps\` are used to store snapshot data in nodes as the data
itself is amenable to \`key -\> value\` pairs.

Below is the \`Snapshot\` messages defined in the protocol protobuf that
nodes adhere to.

\`\`\`protobuf theme={null} /\*\* \* Snapshot contains a summary of all
state events up to the most recent miniblock \*/ message Snapshot {

CommonPayload.Snapshot common = 1;

// Snapshot data specific for each stream type. oneof content {
SpacePayload.Snapshot space_content = 101; ChannelPayload.Snapshot
channel_content = 102; UserPayload.Snapshot user_content = 103;
UserSettingsPayload.Snapshot user_settings_content = 104;
UserDeviceKeyPayload.Snapshot user_device_key_content = 105;
MediaPayload.Snapshot media_content = 106; DmChannelPayload.Snapshot
dm_channel_content = 107; GdmChannelPayload.Snapshot gdm_channel_content
= 108; UserToDevicePayload.Snapshot user_to_device_content = 109; } }
\`\`\`

Take \`SpacePayload.Snapshot\` for example. It defines 4 maps and an
inception event, which is an immutable singleton for each Space stream.
Every time a node is tasked with proposing a block for a stream, if
enough events have accrued (controlled on a stream-by-stream setting in
the inception payload of each stream, \`MinEventsPerSnapshot\`), a
snapshot will be taken as part of miniblock construction potentially
updating all 4 maps in place and including the mutated snapshot object
in the miniblock.

\> The reason snapshots take place after at least
\`MinEventsPerSnapshot\` events have been seen by the node since the
last snapshot is that taking a snapshot is a global memory intensive
operation for a node. Updating the snapshot for every event would
increase memory complexity of miniblock creation to the complexity of
including message events. By doing so periodically in batches, strict
ordering latency is traded for node memory efficiency.

\`\`\`protobuf theme={null} message SpacePayload { message Snapshot { //
inception Inception inception = 1; // streamId: Channel map\<string,
Channel\> channels = 2; // userId: Membership map\<string, Membership\>
memberships = 3; // userId: Username map\<string, WrappedEncryptedData\>
usernames = 4; // userId: Displayname map\<string,
WrappedEncryptedData\> display_names = 5; } } \... \`\`\`

\# Stream Checkpointing Source:
https://docs.towns.com/concepts/stream-checkpointing

Stream Checkpointing is how Towns Protocol ensures data integrity of a
stream on a secure L2 blockchain. This guide provides an in-depth
understanding of the process, focusing on the mini block headers, their
structure, and their role in the Towns Protocol.

\## Mini Block Headers

Mini block headers serve as a compact summary of a mini block\'s
contents, providing essential information needed to verify the integrity
and finality of transactions within the Towns Protocol.

\### Components of a Mini Block Header

A mini block header is an event that encapsulates several critical
pieces of information:

1\. \*\*Hash of Previous Mini Block Header\*\*: This links mini blocks
in a chain, ensuring continuity and traceability. 2. \*\*Hashes of
Events\*\*: These are references to the events included in the current
mini block, acting as a summary of the block\'s content. 3.
\*\*Snapshots (0-1)\*\*: Optional snapshots may be included for
additional context or state information. (see
\[Snapshotting\](./snapshotting)) 4. \*\*Vote Proof\*\*: Evidence of
consensus from participating nodes, confirming the validity of the mini
block\'s contents. 5. \*\*Signature\*\*: The entire event is signed by
the elected leader node, adding an additional layer of security and
authenticity.

\### Storage and Distribution

\* \*\*Local Storage by Nodes\*\*: Each node participating in the Towns
Protocol stores the mini block headers locally. This storage plays a
critical role in maintaining the network\'s integrity and redundancy. \*
\*\*Sent to Clients\*\*: Mini block headers are also transmitted to
clients, providing them with the necessary information to verify
transaction finality and integrity.

\## Finality and Verification

Understanding the finality of transactions within the Towns Protocol is
crucial for maintaining trust in the system. The mini block header plays
a central role in this process:

\* \*\*Transaction Finality\*\*: If a client or node possesses a mini
block header and observes a transaction on the Towns Chain with the same
header hash, the transaction can be considered final. \*
\*\*Verification Process\*\*: The interconnected nature of the mini
block headers, along with the consensus proof and node signatures,
allows for a robust verification process, ensuring the authenticity and
integrity of the data within the Towns Protocol.

\# Towns Protocol Grants Program Source:
https://docs.towns.com/grants/grants-program

Build the future of blockchain communication

\## \*\*Overview\*\*

The \*\*Towns Protocol Grants Program\*\* is designed to accelerate the
growth of decentralized social by funding builders who contribute
meaningfully to the protocol. Our goal is to:

\* Drive innovation through new products and features

\* Onboard new projects that enhance the Towns ecosystem

\* Improve protocol infrastructure with better tooling, automation, and
scalability

Each year is divided into \*\*two Seasons\*\*, with \*\*grants awarded
on a rolling basis\*\* throughout each season. This structure allows us
to \*\*adjust priorities every six months\*\*, ensuring that grant
allocations align with the protocol's most pressing needs.

\## Season One Details

Grant Funding: \*\*Up to \\\$250,000\*\*

Season 1 Deadline: \*\*April 30, 2025\*\*

\[\*\*Apply Here\*\*\](https://hntlabs.deform.cc/grants)

\## \*\*Types of Grants\*\*

Towns Protocol Grants are categorized into two primary funding tracks:

\### \*\*1. Ecosystem Grants\*\*&#x20;

These grants fund specific technical projects that expand the
\*\*capabilities of Towns Protocol\*\*. We are looking for teams to:

\* \*\*Build New Clients\*\*

→ Develop custom interfaces and applications on top of Towns Protocol,
just like propeller.chat, which launched its own independent Towns-based
client.

\### \*\*2. Registry Grants\*\*

For developers building \*\*bots, entitlement modules, and pricing
models\*\* needed for Towns Protocol:

\* \*\*Develop Bots\*\*

→ Automate governance, moderation, engagement, and integrations across
the Towns ecosystem.

\* \*\*Create Custom Modules\*\*

→ Design new entitlement (access control) and pricing models that enable
novel economic structures and community governance.

\## \*\*Grant Funding & Distribution\*\*

In Season 1, \*\*River Eridanus Association\*\* will distribute grants
up to \\\$250k allocated in Towns tokens to fund grants across four
categories:

\<AccordionGroup\> \<Accordion title=\"Building New Clients\"\> We\'re
looking for teams to build independent clients on Towns Protocol-mobile
apps, web interfaces, or something entirely new. You can build any type
of product that has a forum or messaging component: Think web3 versions
of Substack, Patreon, Telegram, Reddit, etc.

\* Check out Propeller.chat, a product feedback client built on Towns
Protocol. If you want to launch your own product on top of Towns
Protocol, we\'ll fund you.

\* We have an SDK to make things easier as you get started. You can find
our React SDK in our docs. \</Accordion\>

\<Accordion title=\"Building Bots \"\> Bots make communities smarter.
Build tools that automate \*\*moderation, governance, notifications, or
integrations\*\* with DeFi, trading, or other apps. If it makes Towns
Protocol more functional, we want to support it.

Here are some ideas:

\* ﻿﻿Cross-Platform Social bots (post to Towns and also Lens/Farcaster)

\* ﻿﻿Wallet following bots

\* ﻿﻿DAO voting bots

\* ﻿﻿Music/Translation/Gaming/Meme bots \</Accordion\>

\<Accordion title=\"Building Entitlement Modules\"\> Access control
matters. We're funding \*\*token-gated systems, staking-based roles, NFT
memberships, and other permission models\*\* to give communities more
control over who can do what.

Here are some ideas:

\* ﻿﻿Token-Staking Access (If you stake a token for a certain length of
time, you can access a specific Town)

\* ﻿﻿Submit a bid for a membership to a Town

\* ﻿﻿NFT-Based Permissions (Different NFT traits grant unique abilities,
like voting power, moderation rights, or premium content access)

\* ﻿﻿Proof of Participation Roles: Users must complete tasks (e.g.,
voting, attending events, posting in discussions) to unlock new
permissions.

\* ﻿﻿POAP-Based Entry: Users must have attended specific events (verified
via POAPs) to gain access.

Check out the current entitlement modules implemented in Towns Protocol:
\[https://github.com/towns-protocol/towns/tree/main/packages/contracts/src/spaces/entitlements\](https://github.com/towns-protocol/towns/tree/main/packages/contracts/src/spaces/entitlements)
\</Accordion\>

\<Accordion title=\"Building Pricing Modules\"\> Monetization is key.
Build \*\*paywalls, tipping systems, subscriptions, or custom pricing
models\*\* that let communities experiment with value exchange on Towns
Protocol.

Here are some ideas:

\* ﻿﻿Recurring weekly/monthly/yearly payments to access Towns

\* ﻿﻿Time-Release Models (This Town can be joined for a certain period of
time)

\* ﻿﻿Auctions to create bidding for premium access to Towns

\* ﻿﻿Leaderboard-driven contributions (Top supporters of a Town get
recognition and special perks)

Check out current pricing modules implemented in Towns Protocol:
\[https://github.com/towns-protocol/towns/tree/main/packages/contracts/src/spaces/facets/membership/pricing\](https://github.com/towns-protocol/towns/tree/main/packages/contracts/src/spaces/facets/membership/pricing)
\</Accordion\> \</AccordionGroup\>

\## Grant Review Process

\### First Round

\| \| \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| \*\*Initial Review on Relevance\*\* \| We assess the project\'s
alignment with \*\*Towns Protocol's mission\*\*, its potential impact on
decentralized social, and its contribution to the ecosystem. \| \|
\*\*Technical Assessment\*\* \| We evaluate the project\'s technical
feasibility, scalability, potential challenges, and how it integrates
with \*\*Towns Protocol\*\* and broader Web3 infrastructure. \| \|
\*\*Decision on Progression\*\* \| Reviewers determine whether the
project meets our criteria for innovation, feasibility, and value to
\*\*Towns Protocol\*\*. Successful projects move on to the second round.
\|

\### Second Round

\| \| \| \| \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| \*\*Plan Presentation\*\* \| Selected teams present a detailed
project plan, incorporating feedback from the first round. \| \|
\*\*Milestone & Grant Amount\*\* \| We finalize key milestones and
confirm the grant amount with each team, ensuring alignment on
deliverables and funding structure. \| \| \*\*Q\\&A Calls\*\* \| Grant
reviewers and project teams engage in \*\*Q\\&A sessions\*\* to clarify
objectives, expectations, and next steps before funding is released. \|

\## How to Apply

If you have an idea that fits, \[apply for a grant
here.\](https://hntlabs.deform.cc/grants)

We look forward to reviewing your application and if you have any
questions about the grants process, please reach out to the Grants
Council at \[grants@towns.com\](mailto:grants@towns.com).

\# Introduction Source: https://docs.towns.com/introduction

\### What is Towns Protocol?

Towns Protocol is an open source protocol for building decentralized
real-time messaging apps. It consists of an EVM-compatible L2 chain,
decentralized off-chain stream nodes, and smart contracts that are
deployed on Base. Towns allows people to create programmable
communication use cases, referred to as "Spaces," in a permissionless
manner. These Spaces are ownable, feature on-chain subscriptions
("Memberships"), an extendable reputation system, and end-to-end message
encryption.

\### Purpose and Vision

At its core, the ecosystem seeks to empower people to create, manage,
and participate in digital communities in a secure and permissionless
manner. The primary goal is to provide a robust, secure, and
decentralized platform where people have complete control over their
data, privacy, and engagement in these digital spaces, while protecting
their reputation. The vision extends to fostering an era of digital
social that is both user-centric and community-driven, leveraging
blockchain technology to ensure trust and security.

Towns' goal is ambitious. To secure freedom of communication for a
sustainable permissionless future.

\### Key features

\*\*An app chain purposefully built for social networking\*\* -- Towns
secures Read/write entitlements separately on Base, allowing our app
chain to make liveliness tradeoffs and send messages to thousands of
participants as fast as any existing centralized social network.

\*\*Ownable communication\*\* -- Space creators truly own the space they
created as an onchain asset.

\*\*Programmable spaces\*\* -- Spaces are deployed onchain with
programmable interfaces allowing the rules, like who can read and write,
to be customized to integrate with any other external EVM-compatible
contract.

\*\*On-chain memberships\*\* with built-in protocol fees -- Users are
required to hold a valid membership token to send and receive messages
in a Space. Paid memberships enforce a protocol fee used to pay for the
operation of the network, while free Spaces do not incur protocol fees.

\*\*On-chain social graph\*\* -- Membership tokens and Spaces are
discoverable on chain.

\*\*Extendable reputation system\*\* -- Towns's communication spaces can
be programmed to allow members peer-based, Space-specific ratings
discoverable on chain.

\*\*End-to-end encrypted messaging\*\* - Ensures secure, private
communication with advanced encryption, protecting messages between
sender and entitled users.

\### High-Level Component Summary

1\. \*\*Towns Smart Contracts\*\*: Deployed on the Base Mainnet Chain,
an Ethereum Layer 2 platform, these contracts enable users to create and
manage their programmable communication space. Each space is minted as a
unique entity, with the minter receiving an owner token, representing
their controlling interest in the space. The smart contracts facilitate
various functionalities, including membership pricing, gated-access,
role-based entitlements, and moderation customizations for each space.
2. \*\*Towns Protocol\*\*: The backbone for social messaging within the
ecosystem. It comprises the Towns Chain and Stream Nodes, collectively
managing encrypted communications across the network. The protocol
ensures secure and private group messaging, essential for maintaining
the integrity of communications within each space. 3. \*\*River Eridanus
Association\*\*: Initially established in the first quarter of 2024 as a
Swiss Association -- the \*\*River Eridanus Association\*\* supports the
further growth and development of the \*\*Towns Protocol\*\*, through
operating its grant programs and disbursement of its initial grant of
tokens. The interaction between the \*\*River Eridanus Association\*\*
and the \*\*Towns Protocol\*\* operates through a series of smart
contracts that ensures transparency and alignment. Notably, the funding
for the \*\*River Eridanus Association\*\* is decided by the holders of
the TOWNS Token holders through the governance of the \[Towns
Lodge\](https://townslodge.com). 4. \*\*\[Towns
Lodge\](https://townslodge.com)\*\*: Responsible for governance and
stewarding of the 3 billion TOWNS Tokens within its Treasury, with the
holders of the TOWNS tokenholders ultimately deciding how to deploy the
Treasury in support of the Towns Protocol. The \[Towns
Lodge\](https://townslodge.com) provides essential balance to the Towns
ecosystem as it provides the TOWNS tokenholders the ability to direct
funding decisions through token governance. 5. \*\*Clients\*\*: Towns is
a permissionless protocol meaning anyone can build a client to interact
with it. Here is a list of popular clients already building on Towns:
Towns, LateCheckout

\# Contracts Source: https://docs.towns.com/node-operator/contracts

Smart Contracts powering the Towns Protocol are deployed to Ethereum L2
networks for testnet and mainnet. This page provides a list of deployed
contracts needed for running nodes and their network coordinates.

\<Note\> All contract source and deployed addresses can also be found on
the \[Towns Protocol
repository\](https://github.com/towns-protocol/towns). Contract source
code is located in the \`contracts\`
\[directory\](https://github.com/towns-protocol/towns/tree/main/packages/contracts).
Deployed addresses can be found under \`packages/generated\` for testnet
and mainnet, respectively. \</Note\>

\### Network Chain Ids

\| Network \| Chain Id \| Network Environment \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \| \-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \| \| Base Sepolia \| 84532 \|
Testnet \| \| Towns Chain Testnet \| 6524490 \| Testnet \| \| Base \|
8453 \| Mainnet \| \| Towns Chain \| 550 \| Mainnet \|

\### Contract Addresses

Below are contract addresses to diamond contracts that are required to
register a node operator on Base.

\<Note\>All contracts are deployed using the
\[Diamond\](https://eips.ethereum.org/EIPS/eip-2535) pattern for
modularity.\</Note\>

\| Contract Name \| Testnet Address \| Mainnet Address \| Network \| \|
\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \-\-\-\-\-\-- \| \| Base Registry \|
\[baseRegistry.json\](https://github.com/towns-protocol/towns/blob/main/packages/generated/deployments/beta/base/addresses/baseRegistry.json)
\|
\[baseRegistry.json\](https://github.com/towns-protocol/towns/blob/main/packages/generated/deployments/omega/base/addresses/baseRegistry.json)
\| Base \|

Below are the deployed diamond contracts that are required to run Stream
Nodes in the Towns Network.

\| Contract Name \| Testnet Address \| Mainnet Address \| Network \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \-\-\-\-\-\-\-\-\-\-- \| \| SpaceFactory \|
\[spaceFactory.json\](https://github.com/towns-protocol/towns/blob/main/packages/generated/deployments/beta/base/addresses/spaceFactory.json)
\|
\[spaceFactory.json\](https://github.com/towns-protocol/towns/blob/main/packages/generated/deployments/omega/base/addresses/spaceFactory.json)
\| Base \| \| Entitlements \|
\[entitlementChecker.json\](https://github.com/towns-protocol/towns/blob/main/packages/generated/deployments/beta/base/addresses/entitlementChecker.json)
\|
\[entitlementChecker.json\](https://github.com/towns-protocol/towns/blob/main/packages/generated/deployments/omega/base/addresses/baseRegistry.json)
\| Base \| \| River Registry \|
\[riverRegistry.json\](https://github.com/towns-protocol/towns/blob/main/packages/generated/deployments/beta/river/addresses/riverRegistry.json)
\|
\[riverRegistry.json\](https://github.com/towns-protocol/towns/blob/main/packages/generated/deployments/omega/river/addresses/riverRegistry.json)
\| Towns Chain \|

\### Towns Token Addresses

\| Network \| Address \| \| \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| Base Sepolia \|
\[0x00000000A22C618fd6b4D7E9A335C4B96B189a38\](https://basescan.org/address/0x00000000A22C618fd6b4D7E9A335C4B96B189a38)
\| \| Base \|
\[0x00000000A22C618fd6b4D7E9A335C4B96B189a38\](https://basescan.org/address/0x00000000A22C618fd6b4D7E9A335C4B96B189a38)
\| \| Ethereum Mainnet \|
\[0x000000Fa00b200406de700041CFc6b19BbFB4d13\](https://etherscan.io/address/0x000000Fa00b200406de700041CFc6b19BbFB4d13)
\|

\### Mainnet Towns Chain Resources

\| Description \| URL \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| Towns Chain Explorer \|
\[explorer.towns.com\](https://explorer.towns.com) \| \| Towns Chain RPC
Node (HTTP) \| \[mainnet.rpc.towns.com\](https://mainnet.rpc.towns.com)
\| \| Towns Chain Hub \|
\[mainnet.hub.towns.com\](https://mainnet.hub.towns.com) \| \| Towns
Chain Bridge L1 -\> L2 \|
\[mainnet.bridge.towns.com\](https://mainnet.bridge.towns.com) \| \|
Towns Chain Status \|
\[mainnet.status.towns.com\](https://mainnet.status.towns.com/) \|

\### Testnet Towns Chain Resources

\| Description \| URL \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| Towns Chain Explorer \|
\[testnet.explorer.towns.com\](https://testnet.explorer.towns.com) \| \|
Towns Chain RPC Node (HTTP) \|
\[testnet.rpc.towns.com\](https://testnet.rpc.towns.com/http) \| \|
Towns Chain Hub \|
\[testnet.hub.towns.com\](https://testnet.hub.towns.com) \| \| Towns
Chain Bridge L1 -\> L2 \|
\[testnet.bridge.towns.com\](https://testnet.bridge.towns.com) \|

\### Celestia Data Availability Layer

Towns uses the Celestia
\[DA\](https://docs.celestia.org/learn/how-celestia-works/data-availability-layer)
(Data Availability) Namespace to store blob data on the Towns Chain in a
scalable, highly available, and cost-effective manner.

\| Namespace ID \| Explorer \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| ca1d e12a 2bf1 0ef2 0a85 \|
\[celenium.io\](https://celenium.io/namespace/000000000000000000000000000000000000ca1de12a2bf10ef20a85)
\|

\# Introduction Source:
https://docs.towns.com/node-operator/introduction

The Towns Protocol is powered by a network of Stream Nodes that are
registered on chain and run by Node Operators. This guide is intended as
an introduction to getting started as an operator and running a node in
the Towns network.

\### Operating Towns Components

\[Towns Stream
Nodes\](https://github.com/towns-protocol/towns/tree/main/core/node) are
software components that are able to be run by anyone. Towns Protocol\'s
incentive structure supports Towns Stream Node operators as a
first-class actor in the network. Operators, once registered and
approved by the DAO , can run a Stream Node on Towns Chain and
participate in block validation as well as reward distribution.

Given the open-source nature of Towns, the Foundation also encourages
developers who would like to run instances of Towns Chain on a network
of their choice connected to self-hosted Towns Stream Nodes. Though
these nodes would not technically be connected to the Towns protocol
node network that is deployed on \[Base
Mainnet\](https://basescan.org/), developers may find value in
experimenting with different rollup implementation features.

\### Operator Onboarding Lifecycle

Operator and node onboarding to the network follow a multi-stage
lifecycle that is designed to ensure the operator is fully prepared and
meets
\[requirements\](/node-operator/tutorials/system-requirements-installation)
to run a node in mainnet.

Each of the following steps are described in detail in subsequent
sections.

\<Steps\> \<Step title=\"Register operator in Testnet\" /\>

\<Step title=\"DAO operator approval in Testnet\" /\>

\<Step title=\"Register node in Testnet\" /\>

\<Step title=\"Register operator in Mainnet\" /\>

\<Step title=\"Achieve sufficient TOWNS token delegation\" /\>

\<Step title=\"DAO operator approval in Mainnet\" /\>

\<Step title=\"Register node in Mainnet\" /\>

\<Step title=\"DAO operator activation in Mainnet\" /\>

\<Step title=\"Participate in TOWNS rewards distribution epochs\" /\>
\</Steps\>

\#### Stream Node Configuration Modes

The below table outlines the current operator service level that is
supported by the Towns Protocol. Supported configurations are outlined
in subsequent sections.

\| Configuration \| Description \| Node Registration \| Stream Reads \|
Stream Writes \| Support \| \| \-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \| \-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-- \| \-\-\-\-\-\-- \| \| Full node \| Stream
node running inside Towns node network \| ✅ \| ✅ \| ✅ \| ✅ \| \|
Info mode \| Stream node running in info mode, unattached to the
network, for debug purposes only. \| ❌ \| ❌ \| ❌ \| ✅ \| \| Archival
node \| Stream node running outside Towns node network storing all
stream events from Towns node network \| ❌ \| Proxied \| Proxied \| ❌
\|

\# Release Process Source:
https://docs.towns.com/node-operator/release-process

Towns protocol releases process and guidelines for node operators.

Towns protocol releases follow a weekly cadence for both testnet and
mainnet. Release artifacts, stream node images, are built and published
to the \[Towns Docker ECR\](https://public.ecr.aws/h5v6m2x1/river).

\## Release Process

\<Steps\> \<Step title=\"Testnet Upgrade\"\> Every Monday (by 11pm UTC),
a new testnet release is cut from the latest alpha release candidate tag
and published to the Towns Docker ECR. The release is tagged with the
testnet version number in the form, \`testnet/YYYY-MM-DD-##\`. The
docker image is built and doubly tagged with \`testnet\` (mutable) and
the commit sha (immutable).

\<br /\>

\<Note\>Operators are encouraged to monitor the Towns Protocol
\[repository\](https://github.com/towns-protocol/towns) for
\`testnet\*\` prefixed tags to upgrade nodes running in
testnet.\</Note\> \</Step\>

\<Step title=\"Mainnet Upgrade\"\> Every Tuesday (by 11pm UTC), a new
mainnet release is cut from the latest alpha release candidate tag and
published to the Towns Docker ECR using the commit sha that was deployed
to \`testnet\` last as the release branch. The release is tagged with
the mainnet version number in the form, \`mainnet/YYYY-MM-DD-##\`. The
docker image is built and doubly tagged with \`mainnet\` (mutable) and
the commit sha (immutable).

\<br /\>

\<Note\>Operators are asked to ensure mainnet images are upgraded by eod
Tuesday to ensure homogeneity of software versions running in
mainnet.\</Note\> \</Step\>

\<Step title=\"Hotfix\"\> Occasionally, an urgent hotfix will be
required to address critical issues. In such cases, the hotfix will be
cut and published to the Towns Docker ECR with a \`hotfix\` tag, a
\`mainnet\` tag, a \`testnet\` tag and commit sha tag. Hotfixes will be
explicitly communicated to operators to upgrade their nodes in the Towns
Operator Town, \`testnet\` nodes first followed by \`mainnet\`.
\</Step\> \</Steps\>

\# Best Practices Source:
https://docs.towns.com/node-operator/tutorials/node-best-practices

The following guide describes high level best practices for running a
Stream Node as a node operator.

\## Node Operations Best Practices

Whether operating nodes in the public cloud or on-premise, the following
best practices are recommended to ensure availability and reliability of
your Stream Nodes.

\### Maintenance

\<Steps\> \<Step title=\"Regular Updates\"\> \* Keep your node software
up to date with the latest security patches and feature updates.
Regularly check for new releases. \* Using the deployment scripts, you
can bring a new instance of a FE up into validation mode, and once you
are confident it is passing health checks, you can switch it to be your
new Running node and de-provision your prior FE. \* Storage schema
updates are performed via db migrations using
\[golang-migrate\](https://github.com/golang-migrate/migrate) and are
performed automatically within releases as part of Node FE upgrades. \*
You are encouraged to set \`STANDBYONSTART\` to true in your environment
variables if you are running blue green deployments behind a proxy or
network load balancer. This will allow you to bring up a new instance of
the FE in standby mode, and once it is passing health checks, it will
automatically switch to primary.

\<br /\>

\<Note\>If your node operator has not yet been fully registered or your
node has not yet been registered, you can test running an unattached
Node Fe to ensure health checks pass by setting \`STANDBYONSTART=true\`.
A node started in this manner will not attach to Storage layer or
shutdown if it is not registered yet on the Towns Chain.\</Note\>
\</Step\>

\<Step title=\"Backups\"\> \* Implement routine backups of your Node
Storage to prevent data loss. \* Establish an operating procedure for
automated or manual data restoration from backups in the event of an
outage. \* Use monitoring tools to track your node\'s performance and
health. \* If your node storage crashes, you can restore a backup, and
recover/catchup from the peers responsible for the same chunks of data.

\<Warning\>As of October 2024, stream replication has not yet been
implemented. Until stream replication is implemented, data recovery
cannot be achieved from peers. Therefore, it is important that node
operators backup their node storage regularly and ensure high
availability through their cloud provider database setup. \</Warning\>
\</Step\>

\<Step title=\"Monitoring\"\> \* Regularly review your node\'s
performance. Use logs, metrics, and profiling tools exposed by node to
tune your observability stack. \* Adjust resource allocation and network
settings as needed to optimize for throughput and reliability.

\<Note\>By settings \`METRICS\_\_ENABLED=true\` in your node\'s
environment, you can enable detailed metrics collection for your node.
Metrics are instrumented using \[Open
Telemetry\](https://opentelemetry.io/docs/specs/otel/metrics/) and can
be used to monitor your node\'s performance and health by navigating to
the metrics endpoint at \`https://\<node-hostname\>/metrics\`. See
\[node observability\](/node-operator/tutorials/node-observability) for
more information.\</Note\> \</Step\> \</Steps\>

\### Troubleshooting

Using logs, metrics and profiling tools, you can identify and resolve
issues with your node. Some issues may have specific resolutions on the
\[Towns Issue
Tracker\](https://github.com/towns-protocol/towns/issues?q=is%3Aissue+is%3Aclosed).

If there\'s a new bug or security vulnerability found, please file an
issue on the \[Towns Issue
Tracker\](https://github.com/towns-protocol/towns/issues/new/choose) for
the core development team to address.

\<Steps\> \<Step title=\"Common Issues\"\> \* Address typical problems
such as connectivity issues, slow transaction processing, or database
errors with targeted troubleshooting steps provided in the network\'s
documentation. \</Step\>

\<Step title=\"Diagnostic Tools\"\> Stream nodes are equipped with a
variety of diagnostic tools to help you troubleshoot issues.

You can run pprof endpoints securely to collect and analyze profiling
data emitted by your node. This is reccommended if you are experiencing
performance issues or suspect memory leaks.

Set \`DEBUGENDPOINTS\_\_PPROF=true\` in your environment variables to
enable pprof endpoints.

Then either set \`DEBUGENDPOINTS\_\_PRIVATEDEBUGSERVERADDRESS\` to a
specific address (i.e. \'127.0.0.1:8080\') and port or
\`DEBUGENDPOINTS\_\_MEMPROFILEDIR\` to a directory to save the memory
profile files periodically.

\`pprof\` endpoints available:

\* /debug/pprof/ \* /debug/pprof/cmdline \* /debug/pprof/profile \*
/debug/pprof/symbol \* /debug/pprof/trace

See
\[debug.go\](https://github.com/towns-protocol/river/blob/main/core/node/rpc/debug.go)
for more information and full capabilities.

\<Note\>If saving pprof results to node image storage, you will need to
mount a volume or read the files between node restarts to prevent losing
them\</Note\>

\<Note\>If you are running a node in a containerized environment, you
will need to mount a volume to the node\'s image storage directory to
save the pprof results\</Note\> \</Step\> \</Steps\>

\### Security

\<Steps\> \<Step title=\"Access Control\"\> \* Implement strict access
controls for administrative operations. Use secure authentication
methods to protect against unauthorized access. \</Step\>

\<Step title=\"Encryption and Network Security\"\> \* Secure data in
transit and at rest using encryption. Apply network security best
practices, such as firewalls and secure protocols, to protect against
external attacks. \</Step\>

\<Step title=\"Regular Security Audits\"\> \* Conduct regular security
audits to identify and mitigate potential vulnerabilities. Stay informed
about the latest security threats and apply recommended countermeasures.
\</Step\> \</Steps\>

\# Node Observability Source:
https://docs.towns.com/node-operator/tutorials/node-observability

The following guide describes the observability capabilities of Towns
Stream Nodes and how to monitor and manage them.

Stream nodes expose \`/metrics\` to export Prometheus metrics on port
\`443\`. The metrics are exposed in the Prometheus format and can be
scraped by a Prometheus server. Both \`process\_\` and \`river\_\`
prefixed metrics are exportable.

Below are the required environment variables for the \*\*Towns Stream
Node Container\*\* related to telemetry:

\| Environment Variable \| Value \| Secret \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \| \-\-\-\-- \| \-\-\-\-\-- \|
\| METRICS\\\_\\\_ENABLED \| true \| no \| \| LOG\\\_\\\_FORMAT \| json
\| no \| \| LOG\\\_\\\_LEVEL \| info \| no \| \| LOG\\\_\\\_NOCOLOR \|
true \| no \|

\### Log forwarding

Log forwarding is under construction.

\# Register Operator Source:
https://docs.towns.com/node-operator/tutorials/register-towns-operator

The following guide illustrates how to register a new Node Operator to
begin onboarding nodes. This guide uses Testnet as an example. The
Mainnet guide follows from this guide with modifications to contract
addresses and rpc url for Towns Chain.

\### Requirements & Dependencies

\* Foundry Toolkit: To install follow
\[this\](https://book.getfoundry.sh/getting-started/installation) guide.
\* Node Operator delegation: address migrated to Towns Chain by DAO (see
below). \* Warm wallet access to Node Operator wallet. \* Sufficient gas
on Node Operator wallet on both Base and Towns Chain to register

\<Note\> The node operator wallet registered on Base must be bridged to
Towns Chain by the DAO prior to proceeding with node registration.
Furthermore, the node operator needs warm access to this wallet to
perform node operations to register, and update a fleet of node
instances. \</Note\>

All contract addresses for testnet and mainnet needed to register
operator can be found in the \[contracts\](/node-operator/contracts)
section.

\<Note\>When referencing contract methods in the below guide, keep in
mind that our contracts are deployed using the \[Diamond
Standard\](https://www.quicknode.com/guides/ethereum-development/smart-contracts/the-diamond-standard-eip-2535-explained-part-1)
pattern. This means for practical purposes that when interacting with
contracts on Base or Towns Chain, you will be calling each method on the
associated diamond contract.\</Note\>

\### Registration Outline

The following outlines the logical steps to onboarding a Node Operator.
Instructions are applicable to testnet and mainnet. Node Operator
delegations are only needed for mainnet registration.

Instructions with specific calling signatures can be found below in the
\[Node Operator Registration\](#node-operator-registration).

\<Steps\> \<Step title=\"Register Node Operator in Base\"\>Operators
starts the onboarding process calling
\[registerOperator\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/src/base/registry/facets/operator/NodeOperatorFacet.sol)
on the
\[BaseRegistry\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/deployments/gamma/base/addresses/baseRegistry.json)
\[diamond\](https://www.quicknode.com/guides/ethereum-development/smart-contracts/the-diamond-standard-eip-2535-explained-part-1)
contract deployed on Base.\</Step\> \<Step title=\"Set Commission Rate
in Base\"\>Operator sets commission rate for rewards in Base calling
\[setCommissionRate\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/src/base/registry/facets/operator/NodeOperatorFacet.sol)
on the BaseRegistry diamond contract with the desired commission rate in
basis points.\</Step\> \<Step title=\"DAO approves operator\"\>DAO
approves operator in Base and Towns Chain via governance once 100mm
delegations of TOWNS token are received to the operator\</Step\> \<Step
title=\"DAO activates operator to start reward clock\"\>Once a node is
running and in a healthy state as observed by the network (see \[check
node health from debug multi
dashboard\](#check-node-health-from-debug-multi-dashboard)), DAO will
activate operator which begins the clock for inclusion in the next
reward distribution.\</Step\> \</Steps\>

\#### Node Operator Registration

1\. Node Operator must call \`registerOperator(address)\` on the
BaseRegistry diamond contract deployed on Base with the address of the
wallet that they wish to claim rewards with. Note that the claimer
wallet can differ from the operator wallet.

\<Info\>Node operators can update the claimer address for receiving
rewards from distribution by calling
\`setClaimAddressForOperator(claimer address, operator address)
onlyClaimer\` on the BaseRegistry contract with the desired wallet from
the Node Operator wallet in Base. This is useful in separating concerns
between the claim wallet that accrues rewards and the operator wallet
which needs to be warm to facilitate node operations.\</Info\>

1\. Node Operator can begin soliciting delegation after being
registered.

2\. Node Operator should call \`setCommissionRate(uint256)\` on the
BaseRegistry contract to set the commission rate for the operator.
Ensure the commission rate is passed in using basis point notation (e.g.
10000 for 100%). Conversely, Node Operator can call the view,
\`getCommissionRate(address)\` passing in their operator address to
check their current commission rate.

3\. After Node Operator receives at least \`100m\` TOWNS tokens
delegated, the DAO can approve it to enter into Towns Chain. The same
address will be added to River Registry on Towns Chain in order to begin
configuring Nodes.

\# Register Node Source:
https://docs.towns.com/node-operator/tutorials/register-towns-stream-node

The following guide illustrates how to register a new Stream Node
instance on Towns Chain. This guide uses Testnet as an example. The
Mainnet guide follows from this guide with modifications to contract
addresses and rpc url for Towns Chain.

\### Requirements & Dependencies

\* Foundry Toolkit: To install follow
\[this\](https://book.getfoundry.sh/getting-started/installation) guide.
\* Node Operator delegation: address migrated to Towns Chain by DAO (see
below). \* Warm wallet access to Node Operator wallet. \* Node URL
pointing via DNS to Node FE attached to Node Storage. \* Access to Base
over RPC endpoint \* Access to Towns Chain over RPC endpoint \*
Sufficient gas on Node Operator wallet on both Base and Towns Chain to
register \* Sufficient gas on Node FE wallet on Towns Chain and Base for
validation and cross-chain transactions once node is operational.

\<Note\> Node FE\'s are stateful and as such require consistent
resolution of hostnames to active instance. To avoid unintended bad
consequences, it is strongly encouraged to configure DNS for Node URL
with exactly 1 A Record per domain name. Put differently, each Node URL
should point to at most 1 IP address. \</Note\>

\<Note\> The node operator wallet registered on Base must be bridged to
Towns Chain by the DAO prior to proceeding with node registration.
Furthermore, the node operator needs warm access to this wallet to
perform node operations to register, and update a fleet of node
instances. \</Note\>

All contract addresses for testnet and mainnet needed to register nodes
can be found in the \[contracts\](/node-operator/contracts) section.

\<Note\>When referencing contract methods in the below guide, keep in
mind that our contracts are deployed using the \[Diamond
Standard\](https://www.quicknode.com/guides/ethereum-development/smart-contracts/the-diamond-standard-eip-2535-explained-part-1)
pattern. This means for practical purposes that when interacting with
contracts on Base or Towns Chain, you will be calling each method on the
associated diamond contract.\</Note\>

\### Registration Outline

The following outlines the logical steps to onboarding a Node FE with
attached storage from 0 to 1. Instructions are applicable to testnet and
mainnet.

Instructions with specific calling signatures can be found below in the
\[Node FE Registration\](#node-fe-registration) sections.

Please ensure you have completed \[Node Operator
registration\](/node-operator/tutorials/register-towns-operator) before
proceeding with node registration.

\<Steps\> \<Step title=\"Start Stream Node in Info Mode\"\>Operator
should start the stream node process in
\[info\](https://github.com/towns-protocol/towns/tree/main/core/node#checking-on-gamma-status-from-local-host)
mode and additionally ensure DNS, TLS, and network are configured
correctly.\</Step\> \<Step title=\"Register Node in Towns
Chain\"\>Operator calls
\[registerNode\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/src/river/registry/facets/node/NodeRegistry.sol)
on the
\[RiverRegistry\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/deployments/gamma/river/addresses/riverRegistry.json)
diamond contract deployed on Towns Chain once health checks
pass.\</Step\> \<Step title=\"Register Node in Base\"\>Operator calls
\[registerNode\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/src/base/registry/facets/checker/EntitlementChecker.sol)
on the BaseRegistry diamond contract to support cross-chain
checks.\</Step\> \<Step title=\"Start Stream Node\"\>Operator starts the
stream node by running the docker image to enter Towns Chain network
once registered.\</Step\> \</Steps\>

\### Node FE Registration

Once a node operator has registered their operator address on Towns
Chain, they can proceed to register their nodes. Nodes are registered
individually on Towns Chain and Base.

\<Warning\> Node Operator addresses must be registered on Towns Chain
before below actions can be undertaken to register a new stream node.
DAO will migrate operator address to Towns Chain once sufficient
delegations are received. \</Warning\>

Once a node is setup, attached to postgres storage, network configured
with a public IP, and passing health checks (see \[System Requirements &
Installation\](/node-operator/tutorials/system-requirements-installation)),
the node is ready to enter the Towns Network and begin accepting stream
writes.

Registering a node on Towns Chain, can be accomplished by calling the
\`registerNode(address,string,uint8)\` method on the RiverRegistry
diamond contract.

\<Warning\> Registering a node and operating a stream node in general
requires that the node wallet has Eth for the target network (Sepolia
Eth for testnet, Eth for mainnet) to pay for gas. On testnet, sepolia
eth can be obtained from a
\[faucet\](https://towns-devnet.hub.caldera.xyz/). Stream nodes should
also have a wallet on Base with Base Eth (mainnet) or Base Sepolia Eth
(testnet) to pay for gas when committing cross-chain transactions.
\</Warning\>

The below steps describe how to register a new node URL in
\`Operational\` status using \`cast\`, a command-line tool that is part
of Foundry for reading / writing to EVM chains over RPC url\'s.

\<Note\> Setting a Node to \`Operational\` status will allow the node to
begin accepting stream writes and signal to the network that the node is
healthy and ready to be connected to by clients. See all possible node
statuses that a node can assume in
\[RegistryStorage\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/src/river/registry/libraries/RegistryStorage.sol#L30).
\</Note\>

\<Steps\> \<Step title=\"Setup Variables for Registration\"\> \`\`\`bash
theme={null} \# checkout repo and extract RiverRegistry deployed address
\$ git clone git@github.com:towns-protocol/towns.git \$ cd river \$
JSON_FILE=\"packages/generated/deployments/testnet/river/addresses/riverRegistry.json\"
\$ RIVER_REGISTRY_ADDRESS=\$(jq -r \'.address\' \"\$JSON_FILE\")

\# set node address, which is wallet address of node\'s ECDSA wallet
created on configuration. NODE_ADDRESS=\<Node FE Wallet Address\>
PRIVATE_KEY=\<Node Operator private key\>

\# node url NODE_URL=\<public node url pointing to a single public IP
address that represents running Node FE pid\>

\# set RPC_URL to point to testnet
RPC_URL=https://devnet.rpc.river.build

\# set BASE_RPC_URL to point to base testnet
BASE_RPC_URL=https://base-sepolia.g.alchemy.com/v2/\${RPC_KEY} \`\`\`

\<br /\>

\<Warning\>Private Key needed for cast call is Node Operator\'s not Node
FE\'s. It is up to Node Operator how they decide to secure this key and
make it available to perform cast calls to register nodes.\</Warning\>
\</Step\>

\<Step title=\"Register Node on Base and Towns Chain\"\> Using \`cast\`
let\'s register our new node. First let\'s check that the Node FE does
not already exist. Node FE\'s are identified in Towns Registry by their
address so let\'s check \`getNode\` to ensure the view reverts with
\`NODE_NOT_FOUND\` before proceeding.

\`\`\`bash theme={null} cast call \--rpc-url \$RPC_URL \\
\$RIVER_REGISTRY_ADDRESS \\ \"getNode(address)\" \\ \$NODE_ADDRESS
\`\`\`

Assuming the above reverts with \`NODE_NOT_FOUND\`, let\'s proceed to
register the new node with the Node Operator\'s wallet.

\<br /\>

\<Note\>Registering a new node is a write transaction that will require
the Node Operator wallet on Towns Chain and Base has Eth. To monitor
Towns Chain transactions, you can use the
\[explorer\](https://explorer.river.build/).\</Note\>

\`\`\`bash theme={null} \# Register a new node with EntitlementChecker
in Base to ensure xchain entitlements are in place when running stream
node. \# Note: EntitlementChecker is a facet and so call it\'s interface
from Base Registry diamond contract (for address see baseRegistry.json
under packages/generated/deployments in river repo).

\# Ensure you call the below with the Node Operator wallet you have
registered on Base. NODE_ADDRESS is the wallet address of the Node FE.
cast send \\ \--rpc-url \$BASE_RPC_URL \\ \--private-key \$PRIVATE_KEY
\\ \$BASE_REGISTRY_ADDRESS \\ \"registerNode(address)\" \\
\$NODE_ADDRESS \`\`\`

\<br /\>

\`\`\`bash theme={null} \# Register a new node in Operational (2) Status
in Towns Chain to signal to the network the node is ready to accept
reads and writes. cast send \\ \--rpc-url \$RPC_URL \\ \--private-key
\$PRIVATE_KEY \\ \$RIVER_REGISTRY_ADDRESS \\
\"registerNode(address,string,uint8)\" \\ \$NODE_ADDRESS \\ \$NODE_URL
\\ 2 \`\`\`

\<Warning\>When registering node, make sure you pass in the node url
including the schema of the url, which must be https\\://. For example,
for node referenced by domain name, river-operator-1.xyz, you would pass
in the node url to registerNode call as
\[https://river-operator-1.xyz\](https://river-operator-1.xyz).
Therefore, prior to calling registerNode using Operational status, you
must ensure the node url resolves from the public internet.\</Warning\>
When the above transactions succeed and have been mined in a block on
Towns Chain, you can re-run \`getNode(address)\` to confirm the node now
exists in the network. \</Step\>

\<Step title=\"Check Node Health from Debug Multi Dashboard\"\> To check
that your node is included in the network and healthy, you can navigate
to: \`\$NODE_URL/debug/multi\` in a browser to see the node\'s http1/2,
grpc ping status and related health metrics.

As an example, see
\[https://ohare-3.staking.production.figment.io/debug/multi\](https://ohare-3.staking.production.figment.io/debug/multi).
\</Step\> \</Steps\>

\# System Configuration Source:
https://docs.towns.com/node-operator/tutorials/system-configuration-steps

The following guide describes steps and best practices for configuring a
Towns Stream Node after meeting the \[system
requirements\](/node-operator/tutorials/system-requirements-installation).

\## Node FE & Storage Configuration

\<Steps\> \<Step title=\"Generate configuration associated with the Node
Storage\"\> Generate an ECDSA wallet that will serve as the Node
identity to the storage layer and network. On Node FE startup, this
wallet will be used to access the appropriate database schema and to
authenticate the Node FE to the Towns Chain during registration.

\<Note\>Only one unique Node FE (by wallet identity) can be associated
with a Node Storage instance at a given time.\</Note\>

\<AccordionGroup\> \<Accordion title=\"Generate node wallet identity
with cast\"\> Wallets can quickly be generated on the command line with
\`cast\`.

\`\`\`bash theme={null} \# generate a new wallet to console in json
format \$ cast wallet n -j \`\`\` \</Accordion\>

\<Accordion title=\"Generate node wallet identity with ethers.js\"\>
Wallets can also be generated with
\[ethers.js\](https://github.com/ethers-io/ethers.js) package in
javascript. See below for an example in javascript.

\`\`\`bash theme={null} \# check if node is installed \$ node -v \#
installs ethers.js \$ npm i ethers \`\`\`

Then copy-paste the below into a file, \`address.js\`. Run with \`node
address.js\` to generate a new wallet and print key to console.

\`\`\`javascript theme={null} var ethers = require(\'ethers\'); var
crypto = require(\'crypto\');

var id = crypto.randomBytes(32).toString(\'hex\'); var privateKey =
\"0x\"+id; console.log(\"SAVE BUT DO NOT SHARE THIS:\", privateKey);

var wallet = new ethers.Wallet(privateKey); console.log(\"Address: \" +
wallet.address); \`\`\` \</Accordion\> \</AccordionGroup\> \</Step\>

\<Step title=\"Generate configuration associated with the Node FE\"\>
During this step, configure your Node FE image or binary to run in your
networked environment that has connectivity to the Node Storage instance
and set your Node FE environment variables, such as RPC\\\_URL\'s,
logging level, contract addresses.

Some of the required environment variables will be secrets as described
in \[system
requirements\](/node-operator/tutorials/system-requirements-installation#node-fe-environment-variables)
that will need to be stored and injected in your runtime securely.
Choices around secret storage depend largely on the cloud or on-premise
hosting environment for the Node FE, which is left up to the node
operator. \</Step\>

\<Step title=\"Node Front End (FE)\"\> Configure your Node FE with a
publicly addressable, static IPv4 host, ensuring it can serve HTTP1.1 &
HTTP2 requests. If behind a termination proxy, configure accordingly.
Ensure your network does not proxy traffic through an ALB as this has
been known to cause issues with client connectivity.

Configure DNS with a hostname and either an A record or CNAME record to
your static IPv4 address.

\<Note\>By convention, it is reccommended that hostnames for nodes in
mainnet be defined on a per operator address basis with a subdomain
using an airport code prefix distinct from other node operators as in
\`\<airport-code\>-\<node_number\>.\<domain\>\`. See \[mainnet node
list\](https://haneda-1.nodes.towns-u4.com/debug/multi) for additional
examples of the convention. \</Note\>

\<Warning\> Application level load balancers (ALBs) require a very
specific configuration to handle gRPC traffic as well as ALPN with
HTTP1/2 and therefore are not supported at this time.

Terminate TLS at your origin server and use a static IPv4 address for
your Node FE. Network load balancers are supported assuming 1 LB
instance per origin. \</Warning\> \</Step\>

\<Step title=\"Node Storage Setup\"\> Set up Node Storage (e.g.,
Postgres), ensuring your Node FE can connect within your hosting
network.

Run network probes on the Node FE in \[info
mode\](https://github.com/towns-protocol/towns/tree/main/core/node#checking-on-gamma-status-from-local-host)
to ensure network connectivity, TLS termination, and that the node is
publicly addressable over DNS. \</Step\> \</Steps\>

\# System Requirements & Installation Source:
https://docs.towns.com/node-operator/tutorials/system-requirements-installation

The following guide describes system requirements, dependencies, and
installation details recommended for running a Towns Stream Node. This
guide applies to nodes running in either Testnet or Mainnet.

\<Note\>By adhering to the guidelines outlined in this guide, node
operators can contribute to the stability and efficiency of the Towns
Network. Effective node operation not only benefits the individual
operator by ensuring optimal node performance but also supports the
health and reliability of the entire network.\</Note\>

\<br /\>

\### System Requirements & Dependencies

To run a Towns Stream Node, an operator will need to run a Node Frontend
(FE) and Node Storage layer, postgres database, with a specific network
configuration.

Please read the below requirements carefully prior to proceeding with
node setup.

\<Accordion title=\"Node Frontend (FE) Requirements\"\> \* \*\*CPU\*\*:
Minimum 8 virtual CPUs. \* \*\*Memory\*\*: At least 32 GB of RAM.  -
\*\*Architecture\*\*: x64 or ARM64 supported. \* \*\*Network\*\*:
Dedicated, static public IP address, capable of handling up to 1 Gbps
ingress and egress for HTTP 1.1/2 traffic. \* \*\*Blockchain RPC
Access\*\*: Access to blockchain RPC provider endpoints for Base Chain,
Towns Chain, and cross-chain chain ids. \</Accordion\>

\<Accordion title=\"Node Storage Requirements\"\> \* \*\*Database
Compatibility\*\*: Postgres 15.4 or newer. \* \*\*Transaction
Processing\*\*: Capable of handling up to 10k IOps. \* \*\*Storage
Capacity\*\*: Minimum 2 TB of storage. \* \*\*Keypair store\*\*:
Location to store ECDSA keypair associated with the data stored in the
database.

\<Note\>It is highly recommended to run a distinct Postgres instance for
each Node FE to ensure resource isolation during upgrades.\</Note\>
\</Accordion\>

\<Accordion title=\"Node Eth Balance Requirements\"\> \* \*\*Towns Chain
Eth Balance\*\*: Minimum 1 ETH on all stream node wallets in Towns Chain
to support gas needed for miniblock validation. \* \*\*Base Chain Eth
Balance\*\*: Minimum 0.5 ETH on all stream node wallets in Base Chain to
support gas needed for cross-chain entitlement checks. \<Note\>Set up
alerts to monitor the balance of the node\'s Eth balance on Towns Chain
and Base Chain at a minimum alert threshold of 0.25 ETH and 0.1 ETH
respectively.\</Note\> \</Accordion\>

\<br /\>

\### Installation

Node FE\'s can be installed either from docker with the Towns public
\[ECR image registry\](https://public.ecr.aws/h5v6m2x1/river) or built
from \[source
code\](https://github.com/towns-protocol/towns/tree/main/core/node).

\#### Installation from Docker

\<Accordion title=\"Install Image from Towns Public Image Registry\"\>
The Towns Protocol maintains a public docker image registry
\`public.ecr.aws/h5v6m2x1/river\` for images that are built officially
from \[source\](https://github.com/towns-protocol/towns) during CI/CD.
As such, node operators can easily install the latest Node FE software
from images stored in the public ECR registry. Images are tagged during
\[releases\](/node-operator/release-process) with the associated commit
as well as mutable tags \`mainnet\`, \`testnet\`, for each network
respectively.

\`\`\`bash theme={null} docker pull
public.ecr.aws/h5v6m2x1/river:testnet docker tag
public.ecr.aws/h5v6m2x1/river:testnet river-node \`\`\`

\<Note\>Images are tagged by their merge commit hash so to install a
specific version of the Node FE software, use the commit hash from
source instead of the \`testnet\` or \`mainnet\` tag, which references
the latest built image.\</Note\>

\`\`\`bash theme={null} git clone
git@github.com:towns-protocol/towns.git \# print out shorthand commit
hashes git log \--pretty=format:\'%h\' \| cut -c 1-7 \# choose one to
pull COMMIT_HASH=1dd452a docker pull
public.ecr.aws/h5v6m2x1/river:\$COMMIT_HASH \`\`\`

\<Info\> The CI job that builds docker images to the river public ecr
registry can be found
\[here\](https://github.com/towns-protocol/towns/blob/main/.github/workflows/River_node_docker.yml).
\</Info\> \</Accordion\>

\<Accordion title=\"Build Docker Image from Source\"\> As of October
2024, as an alternative to the public ECR registry, it is recommended to
build the docker image from the source
\[Dockerfile\](https://github.com/towns-protocol/towns/blob/main/core/Dockerfile)
to ensure compatibility with the latest software version.

\`\`\`bash theme={null} git clone
git@github.com:towns-protocol/towns.git cd river/core docker build -t
river-node . \`\`\` \</Accordion\>

\<br /\>

\### Node FE Environment Variables

Towns Stream Nodes run expecting certain environment variables to be
present in the process environment and set at runtime. Config, which is
described in
\[config.go\](https://github.com/towns-protocol/towns/blob/main/core/config/config.go),
is injected into the binary at runtime using
\[viper\](https://github.com/spf13/viper).

\<Note\>For the list of contracts required to run nodes and their
addresses, see \[contracts\](/node-operator/contracts). \</Note\>

\<br /\>

\| Environment Variable \| Purpose \| Required \| Testnet Value \|
Secret \| \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \-\-\-\-\-- \| \| ARCHITECTCONTRACT\\\_\\\_ADDRESS \| SpaceFactory
contract address in Base Network \| Yes \|
0x5A077e686545c541476D3a99711dE42339357467 \| - \| \|
ARCHITECTCONTRACT\\\_\\\_VERSION \| Contract interface version \| Yes \|
v3 \| - \| \| BASECHAIN\\\_\\\_CHAINID \| Base ChainId \| Yes \| 84532
\| - \| \| BASECHAIN\\\_\\\_NETWORKURL \| Base Chain RPC Url \| Yes \|
\[https://sepolia.base.org\](https://sepolia.base.org) \| Yes \| \|
CHAINSSTRING \| List of chainIds and network RPC Urls supported \| Yes
\| see \[Cross-chain
Requirements\](/node-operator/tutorials/system-requirements-installation#cross-chain-requirements)
\| - \| \| DATABASE\\\_\\\_DATABASE \| Postgres DB Name \| Yes \| river
\| - \| \| DATABASE\\\_\\\_EXTRA \| Extra Postgres Options \| Yes \|
?sslmode=disable\\&pool\\\_max\\\_conns=1000 \| - \| \|
DATABASE\\\_\\\_HOST \| Postgres DB Host Url \| Yes \| - \| - \| \|
DATABASE\\\_\\\_PASSWORD \| Postgres DB Password \| Yes \| - \| Yes \|
\| DATABASE\\\_\\\_PORT \| Postgres DB port \| Yes \| 5432 \| - \| \|
DATABASE\\\_\\\_USER \| Postgres DB username \| Yes \| - \| - \| \|
DD\\\_TAGS \| Used by Datadog for metrics collection \| No \| env:
(gamma), node\\\_url:(your complete node url) \| No \| \|
DEBUGENDPOINTS\\\_\\\_PPROF \| Enable pprof endpoints \| No \| false
\| - \| \| DEBUGENDPOINTS\\\_\\\_PRIVATEDEBUGSERVERADDRESS \| Private
debug server address \| No \| :8080 \| - \| \|
DEBUGENDPOINTS\\\_\\\_MEMPROFILEDIR \| Directory for memory profile
files \| No \| ./mem\\\_profile \| - \| \|
ENTITLEMENT\\\_CONTRACT\\\_\\\_ADDRESS \| Entitlement contract address
in Base Network \| Yes \| 0x0d7eC5826626070b6a250C9878940D070128A265
\| - \| \| LOG\\\_\\\_FORMAT \| Log format option \| No \| text \| - \|
\| LOG\\\_\\\_LEVEL \| Default log level \| No \| info \| - \| \|
LOG\\\_\\\_NOCOLOR \| Logging without color \| No \| true \| - \| \|
METRICS\\\_\\\_ENABLED \| Metrics exporter enabled \| No \| true \| - \|
\| METRICS\\\_\\\_PORT \| Metrics export port \| No \| 8081 \| - \| \|
PERFORMANCETRACKING\\\_\\\_PROFILINGENABLED \| Used by Datadog for cpu
profiling \| no \| true \| No \| \|
PERFORMANCETRACKING\\\_\\\_TRACINGENABLED \| Used by Datadog for tracing
\| no \| true \| No \| \| PORT \| Port RPC service listens on \| Yes \|
443 \| - \| \| REGISTRYCONTRACT\\\_\\\_ADDRESS \| River Registry
contract address in Towns Chain Network \| Yes \|
0x94bdc7016057fc47cC006Bc837bF0Aed5Dc5C6D6 \| - \| \|
RIVERCHAIN\\\_\\\_CHAINID \| Towns Chain chainId \| Yes \| 6524490 \| -
\| \| RIVERCHAIN\\\_\\\_NETWORKURL \| Towns Chain RPC Url \| Yes \|
\[https://testnet.rpc.towns.com/http\](https://testnet.rpc.towns.com/http)
\| Yes \| \| RUN\\\_MODE \| Stream Node Run Mode (full, archive) \| No
\| full \| - \| \| SKIP\\\_GENKEY \| Skip generating node ECDSA wallet
keypair \| Yes \| true \| - \| \| STANDBYONSTART \| Start node in
standby mode \| No \| false \| - \| \| STORAGE\\\_TYPE \| postgres or
in-memory \| No \| postgres \| - \| \| TLSCONFIG\\\_\\\_CERT \| TLS
certificate value for node hostname \| Yes \| - \| Yes \| \|
TLSCONFIG\\\_\\\_KEY \| TLS certificate key for node hostname \| Yes
\| - \| Yes \| \| TOWNS\\\_ENV \| Environment name for network
configuration (beta for testnet, omega for mainnet) \| Yes \| beta \| -
\| \| WALLETPRIVATEKEY \| Node ECDSA private key string \| Yes \| - \|
Yes \|

\<Note\> Testnet Values provided above are as of May 2024. New contract
addresses can be found in \`packages/generated/\*\*\` of river repo.
\</Note\>

\<Warning\> Environment variables marked as Secret require proper
encrypted storage and management. It is up to node operators to choose a
secure store for such secrets depending on their runtime operating
environment be it cloud or on-premise. \</Warning\>

\### Cross-chain Requirements

\`CHAINSSTRING\` environment variable is a comma-separated, colon
delimited list of chain ID\'s and RPC Urls that is required for nodes to
support cross-chain entitlement checks. As of June 2024, the Towns
network must support the following chainIds listed in the below table
for testnet, mainnet, respectively.

As an example, using redacted RPC urls from Web3 providers, the
\`CHAINSSTRING\` environment variable for Mainnet would look like:

\`\`\`
1:https://eth-mainnet.g.alchemy.com/v2/\$ETHEREUM_API_KEY,8453:https://base-mainnet.g.alchemy.com/v2/\$BASE_API_KEY,42161:https://arb-mainnet.g.alchemy.com/v2/\$ARBITRUM_MAINNET_API_KEY,137:https://polygon-mainnet.g.alchemy.com/v2/\$POLYGON_API_KEY,10:https://opt-mainnet.g.alchemy.com/v2/\$OPTIMISM_API_KEY
\`\`\`

\<Warning\>Do not use public RPC provider urls found on
\[chainlist\](https://chainlist.org/) or elsewhere as these are
notoriously unstable. Node Operators are encouraged to provision RPC
Urls for high availability for each supported chainId by using custom
provisioned provider urls from \[Alchemy\](https://www.alchemy.com/) or
\[Infura\](https://www.infura.io/).\</Warning\>

\### Testnet Cross-Chain Chain Ids Required

On testnet, nodes should support the following chain ids with configured
RPC endpoints for cross-chain entitlement checks.

\| Chain Id \| Network \| \| \-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \| \| 1 \| Ethereum Mainnet \| \|
11155111 \| Ethereum Sepolia \| \| 8453 \| Base Mainnet \| \| 84532 \|
Base Sepolia \| \| 42161 \| Arbitrum One \| \| 137 \| Polygon Mainnet \|
\| 10 \| Optimism Mainnet \| \| 10200 \| Gnosis Chiado \|

\### Mainnet Cross-Chain Chain Ids Required

On mainnet, nodes should support the following 6 chain ids for
cross-chain entitlement checks.

\| Chain Id \| Network \| \| \-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \| \| 1 \| Ethereum Mainnet \| \| 8453
\| Base Mainnet \| \| 42161 \| Arbitrum One \| \| 137 \| Polygon Mainnet
\| \| 10 \| Optimism Mainnet \| \| 100 \| Gnosis \|

\# Upgrade Node Source:
https://docs.towns.com/node-operator/tutorials/upgrade-towns-stream-node

The following guide illustrates how to upgrade a Towns Stream Node on
Towns Chain in Testnet. The Mainnet guide follows from this guide with
modifications to contract addresses and rpc url for Towns Chain.

\<Note\>It is assumed that the node operator wallet registered on Base
has been bridged to Towns Chain by the DAO and that the node operator
has warm access to this wallet to perform node operations to register,
and update a fleet of nodes.\</Note\>

Nodes will need to be upgraded as part of maintenance operations to keep
up-to-date with version upgrades and fixes. Upgrading can be
accomplished from source or docker image. This guide will focus on
upgrading from the Towns Protocol public ecr registry:
\`public.ecr.aws/h5v6m2x1/river\`, which hosts docker images built for
version upgrades and hotfixes across testnet and mainnet.

\### Node Components

The below diagram describes component relations between Node FE
(Frontend), Node Identity, Node Storage, IP Address, Stream from the
network\'s perspective assuming an
\[Operational\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/src/river/registry/libraries/RegistryStorage.sol#L33)
Node FE as described by the RiverRegistry on-chain state.

\`\`\`mermaid theme={null} \-\-- title: Node Components Network
Perspective \-\-- erDiagram NodeFE \|\|\--\|\| WalletIdentity : \"has
a\" NodeFE \|\|\--\|\| NodeStorage : \"attaches to\" NodeStorage
\|\|\--\|\| WalletIdentity : \"is partitioned by\" NodeFE \|\|\--\|\|
IPAddress : \"points to one\" NodeFE \|\|\--\|\| Stream : \"is randomly
assigned\" Stream \|\|\--\|\| NodeFE : \"has reference to on-chain\"
\`\`\`

\### Upgrade a Node

Upgrading Node FE software can be achieved with a new node identity or
existing node identity.

\<Note\>It is currently reccommended to upgrade node software with
existing node identity that is stored in RiverRegistry. Once Stream
rebalancing is implemented, upgrades that create and register a new node
identity can be safely enacted without potential stream
downtime.\</Note\>

The below assumes an upgrade path from docker. Futures guides will focus
on upgrades from source.

\`\`\`mermaid theme={null} flowchart TB updateSoftware(\"pull latest
image from Towns docker registry\") \--\> ID(\"use current node
identity?\") ID \-- no \--\> newNodeID(\"new node identity\") ID \-- yes
\--\> existingNodeID(\"current node identity\") existingNodeID \--\>
startNodeFE(\"start Node FE from image\") startNodeFE \--\>
healthChecks(\"run health checks\") healthChecks \-- pass \--\>
shutdownExisting(\"shutdown existing Node FE\") healthChecks \-- fail
\--\> restartExisting(\"restart existing Node FE\") \`\`\`

\### Upgrading a Node with existing identity steps

The below steps further describe the reccommended path to upgrade Node
FE from the RHS of the above flowchart.

\<Note\>This guide assumes the node operator performing the upgrade has
access to an existing node\'s wallet private key as well as credentials
to connect to a write instance of the Node Storage instance.\</Note\>

\<Steps\> \<Step title=\"Pull latest river image\"\> \`\`\`bash
theme={null} \$ docker pull public.ecr.aws/h5v6m2x1/river:testnet \`\`\`
\</Step\>

\<Step title=\"Start Node FE\"\> Once you\'ve pulled the latest image
and have set your environment variables, you can start your Node FE
docker container within your network configuration.

\<Warning\>Ensure you are starting your node\'s container with
\`SKIP_GENKEY=true\` otherwise a new node wallet will be created and
attached to your Node storage.\</Warning\>

If you have any load balancers configured, please ensure that the public
IP pointed to by the node identity\'s node url (found in RiverRegistry)
routes to the new pid for this Node FE. \</Step\>

\<Step title=\"Run health checks\"\> If you\'ve exposed metrics, you
should have a separate service running on
\`http:/localhost:8081/metrics\` that you can inspect to ensure the Node
FE is up and running properly. \</Step\>

\<Step title=\"Shutdown old Node FE\"\> If you\'ve come this far, you
have a new Node FE pid running attached to your Node Storage Postgres DB
meaning the node is ready to serve writes. Furthermore, your node URL
attached to your node\'s identity should be resolving to the IP of your
node.

At this point, you can safely shutdown your old Node FE as it is not
proxying any traffic for the network. \</Step\> \</Steps\>

\# Governance Framework Source:
https://docs.towns.com/token-governance/governance-framework

The Towns Lodge Governance Framework is designed to ensure a balanced,
sustainable, and effective development of the \*\*Towns Protocol\*\*. By
ensuring all the mechanisms for compliance and administrative
requirements are met, the members can focus on funding decisions that
will shape the future of the protocol and the community. Continued
funding decisions to the existing framework allows would allow for the
members to be involved without taking on community roles -- however, the
governance process also supports community growth and member roles.\\
For example, the Grants Program could easily become a part of the Towns
Lodge with members of the community being elected to form the committee
or funding decisions beyond the existing Association can be complicated
to expand the mechanisms for which the Treasury supports the Towns
Protocol.\\ This framework is the bedrock upon which the Towns Lodge
operates, providing a structured approach to decentralized
decision-making

\### Decentralization

Central to the Towns Lodge is the principle of decentralization. This
ensures that power and decision-making are not concentrated in the hands
of a few but are distributed across the wider community. The governance
framework is designed to prevent central points of failure and promote a
diverse and inclusive decision-making process.

\### Transparency

Every aspect of the Towns Lodge, from proposal submission to the final
implementation of decisions, is conducted with utmost transparency.
Token voting ensures that all actions are recorded and are publicly
verifiable, fostering trust and accountability within the community.

\# Overview Source: https://docs.towns.com/token-governance/overview

The Towns Lodge represents a pivotal component in the \*\*Towns
Protocol\*\* ecosystem, embodying a decentralized governance structure
that upholds the principles of transparency, autonomy, and
community-driven decision-making. Organized as a Wyoming Decentralized
Unincorporated Nonprofit Association, the Towns Lodge oversees 3 billion
TOWNS Tokens in its Treasury allowing all tokenholders to have a voice
in how that value should be utilized in shaping protocol\'s future.

\## The Essence of Towns Lodge

At its core, Towns Lodge facilitates a democratic platform where
proposals related to the \*\*Towns Protocol\*\* are discussed, voted
upon, and implemented. This ensures that the protocol evolves in a way
that resonates with the collective will of its stakeholders,
specifically those who run the network, create Spaces, and use River for
communication. Its structure is designed to be both inclusive and
effective, accommodating diverse opinions while maintaining a
streamlined decision-making process.

\## Functionality and Governance

Towns Lodge is designed for an incremental rollout to allow TOWNS
tokenholders the ability to experience the system as designed. At
present, the River Eridanus Association board of directors makes
governance decisions to directly and indirectly further the growth and
development of the Towns Protocol. However, in a novel application
designed to empower TOWNS tokenholders -- the 3 billion TOWNS Tokens
held in the Treasury are under the control of the TOWNS tokenholders
themselves.\\ When token governance is goes live on January 1st, 2026,
it is the TOWNS tokenholders who will decide whether to keep funding the
\*\*River Eridanus Association\*\* and through proposals always have a
voice in the decision-making.

\## Token-based Governance

Towns Lodge is pioneering a new governance structure focused on getting
the actual stakeholders of the ecosystem the most important voice,
without requiring them to shoulder the day-to-day operations (although
-- if that is the direction members ultimately want -- they would be
able to accomplish it through governance). Node Operation NFT and Space
Owner NFT holders will have a preferential role within in token
governance as their proposals will be subject to lower temp-check
thresholds before bringing their proposal to a vote of the community --
giving those that have invested their time and energy to the community
the clearest voice in its decisions.

The Towns Token (TOWNS) plays a crucial role in the governance model. It
serves as a tool for voting, where the weight of a stakeholder\'s vote
is proportional to their token holdings. This token-based governance
model encourages active participation from the community, ensuring that
those who are invested in the protocol have a say in its direction.

\## Vision and Mission

The Towns Lodge's objective is to create a self-sustaining, resilient,
and adaptable protocol that remains responsive to the needs of its users
and the broader blockchain community. By fostering an environment of
collaboration and innovation, Towns Lodge aims to lead the way in
demonstrating the power and potential of decentralized governance in the
blockchain realm.

\# Towns Token Source:
https://docs.towns.com/token-governance/towns-token

\# Overview

The Towns Token (TOWNS) serves multiple roles in the Towns ecosystem.
Nodes are required to have a minimum amount of tokens delegated in order
to operate in the network. TOWNS token is used to compensate Nodes via
inflationary rewards. Spaces earn additional functionality when they
reach different levels of token delegation. As a governance token, it
empowers its holders to influence the direction and policies of the
ecosystem. TOWNS is also used to incentivize node operators, developers,
and users while fostering long-term growth and engagement of the Towns
protocol.

\## Utility of TOWNS

\### Use by Nodes

TOWNS tokens are essential for nodes within the Towns network. To
operate, nodes must have a minimum requirement of TOWNS tokens delegated
to them. This requirement ensures a committed and stable node operation
within the network. Moreover, nodes with a higher amount of staked
tokens gain priority in the operational queue, reflecting the finite
capacity of active nodes at any given moment.

\* This requirement is met by a combination of tokens delegated directly
to the node as well as Spaces that point their delegated tokens to that
node.

\### Use by Spaces

Spaces within the Towns ecosystem can leverage TOWNS tokens for enhanced
functionalities and governance. With delegated tokens, Spaces can
implement custom entitlement logic on other EVM chains besides Base.
Higher amounts of delegated tokens allows for custom pricing modules
without \[Towns Lodge\](https://townslodge.com) approval, such as
allowing members access at no cost.

\### Token Delegation

\* \*\*User to Space/Node Delegation\*\*: TOWNS holders can delegate
their tokens to either a Space or a Node, a mechanism that underpins the
governance model of the Towns ecosystem. This delegated stake allows
users to contribute to the protocol\'s governance, emphasizing the role
of Space operators as key governance participants. \* Delegated tokens
are not transferable. When tokens are undelegated, a 60-day countdown is
initiated before the tokens are transferable again. This period is
required to allow time to rebalance streams of a given node if
delegation is removed below the minimum requirement. \* \*\*Spaces
Pointing to Nodes\*\*: Spaces can point their tokens to nodes, aiding
them in meeting the minimum operational requirements. This symbiotic
relationship allows Spaces to partake in the inflationary rewards earned
by the Node, without transferring governance rights, which remain with
the Space. \* It is important to note that by pointing to a given node,
a Space is signifying good nodes to operate in the ecosystem but has no
additional relationship where the Space would be provided better
service, as all active Nodes in the system perform equal work.

\### Use for Governance

Governance within the Towns ecosystem is exclusively driven by delegated
tokens. This model ensures that only stakeholders actively participating
through delegation have a say in governance decisions, promoting a more
engaged and responsible governance community.

\## Token Information

\* \*\*Symbol/Network\*\*: TOWNS is an ERC20 token on the Base and
Ethereum Mainnet. \* \*\*Supply\*\*: The initial supply is set at 10
billion tokens, with a designed inflationary model. \*
\*\*Inflation\*\*: TOWNS token is programmed with initial 8% inflation
which decreases linearly over 20 years until it hits a final inflation
rate of 2%. \* \*\*Distribution\*\*: The distribution of TOWNS tokens is
as follows: approximately 35% to the team and investors, 5% to HNT Labs,
and the remaining 60% allocated to the association. The initial
allocations to the team and investors are subject to a one-year lock-up
period, followed by a two-year linear vesting schedule. \* \*\*Contract
Addresses\*\*: The TOWNS token is deployed on: Base:
0x00000000A22C618fd6b4D7E9A335C4B96B189a38 Ethereum:
0x000000Fa00b200406de700041CFc6b19BbFB4d13

\## Association Initiatives

\### Airdrops

The Towns ecosystem will conduct multiple airdrops targeting various
stakeholders to stimulate engagement and reward early adopters. The
first airdrop will focus on Space Owners with paying members, paying
members, other Space Owners and members, in that order.

\### Community Rewards

A biweekly distribution model is planned for Community Rewards,
allocating a fixed amount of tokens to Spaces with significant delegated
tokens relative to each other. These rewards are designed to encourage
token delegation and active participation in governance and introduce a
team competition component to drive engagement. These incentive rewards
will either be distributed to the Space or back to the members directly
pro rata.

\### Grants Programs

The association will establish committees to oversee the grant programs,
aimed at supporting the development of the Towns Protocol and its
applications. These grants are intended to catalyze innovation and
growth within the Towns ecosystem. The initial grants will focus on
client developers building on the Towns protocol and additional Towns
stream and storage implementations for the protocol itself.

\# Node Operators Source:
https://docs.towns.com/towns-messaging-protocol/node-operators

\## Registration and Delegation

\* \*\*Node Registry Contract\*\*: Node Operators begin by calling the
\`register\` function on the Node Registry contract deployed on Base.
This initial step enters them into the system and marks the beginning of
their operational journey. \* \*\*Soliciting Delegation\*\*: After
registration, Node Operators are eligible to solicit delegation to their
address. This is a crucial step where operators gather support from
token holders, who delegate their tokens to the operator as a sign of
trust and endorsement.

\## Approval Process

\* \*\*Petitioning for Approval\*\*: Once a Node Operator has
accumulated sufficient delegation, they can petition the DAO for
approval. This step is vital as it involves a review by the DAO to
ensure the operator meets the required standards and guidelines for
network operation.

\* \*\*Approval\*\*: If approved, the Node Operator is officially added
to the active set on the River Registry contract deployed on the Towns
Chain. This approval marks the operator as a trusted and recognized
entity within the network.

\## Node Management

\* \*\*Adding Individual Nodes\*\*: With approval, Node Operators can
then add individual Nodes under their wing. This involves configuring
and setting up Nodes to perform various functions within the network.

\* \*\*Node States\*\*: Nodes can exist in several states: \*
\*\*Idle\*\*: Newly added Nodes start in an idle state, where they are
present within the network but not actively participating in operations.
\* \*\*Unattached State\*\*: Nodes can then move to an unattached state,
where they run and relay requests without being responsible for any
specific stream. In this state, Nodes do not have dedicated storage and
serve a more auxiliary function. \* \*\*Attached State\*\*: The ultimate
goal for a Node is to reach the attached state, where it becomes fully
operational and responsible for new streams. In this state, a Node is
fully integrated into the network, participating in data storage,
processing, and relay functions. \* \*\*Exiting\*\*: The Node is
signaling that it is planning to exit and so should begin offloading
stream data to other active nodes in the network.

\# Overview Source:
https://docs.towns.com/towns-messaging-protocol/overview

\## Introduction

The Towns Messaging Protocol is the essential infrastructure for
validating and moving encrypted messages between users. It introduces an
innovative approach to secure and private group messaging. Designed to
operate seamlessly within the blockchain infrastructure, this protocol
leverages the robustness of decentralized technology to offer a
high-quality permissionless messaging experience.

Read/write entitlements are secured on Base, allowing Towns to make
liveliness tradeoffs to send messages to thousands of participants as
fast as any existing centralized social network. Towns protocol is
initially built for broad chat application use cases with business logic
for chat but in the future the protocol will be abstracted to form a
base layer for any form of encrypted message passing use cases.

\## Key Features

\### Encrypted Communication

\* \*\*End-to-End Encryption\*\*: Utilizing state-of-the-art encryption
methodologies, the Towns Messaging Protocol ensures that all
communications are secure from end to end. No one besides the sending
and entitled users, including Towns Node Operators, are able to decrypt
and read any messages in the Towns ecosystem. \* \*\*Privacy by
Design\*\*: Emphasizing user privacy, the protocol guarantees that
message contents remain inaccessible to anyone other than the intended
recipients.

\### Decentralization

\* \*\*Distributed Network\*\*: The protocol operates on a network of
distributed nodes, ensuring reliability and resilience against central
points of failure. \* \*\*User Autonomy\*\*: Spaces within the protocol
are user governed, fostering a community-driven environment where users
have control over their communication channels.

\### Scalability and Efficiency

\* \*\*Scalable Architecture\*\*: Designed to handle high volumes of
messages without compromising speed or security. \* \*\*Resource
Optimization\*\*: Efficient use of network resources ensures that the
protocol remains sustainable and cost-effective.

\## Components

\### Towns Chain

\* A Layer 2 blockchain solution that acts as the backbone of the Towns
Messaging Protocol, providing consensus and security.

\### Stream Nodes

\* Nodes responsible for managing the flow of messages within the
protocol, handling tasks such as message validation, storage, and
encryption.

\### Entitlement Management

\* Systems to manage user permissions and access within Spaces, ensuring
a secure and organized communication environment.

\# Event Lifecycle Source:
https://docs.towns.com/towns-messaging-protocol/stream-nodes/event-lifecycle

\# User Event Lifecycle

This section outlines the lifecycle of a user event within the protocol.
Each step is crucial in ensuring a seamless and secure transmission of
data.

1\. \*\*Initiation of Event\*\*: The lifecycle of an event initiates
with a user action. e.g. sending a message, joining a channel, etc.

2\. \*\*Payload Construction\*\*: Following the user action, a payload
is constructed that describes the desired action. For specific payload
types, such as messages, encryption is applied.

3\. \*\*Reference to Previous Mini Block Hash\*\*: Each payload includes
a reference to the hash of the preceding mini block, establishing a link
in the chain of events.

4\. \*\*Signing the Event\*\*: The user signs the payload, thereby
converting it into an event. This step is crucial for validating the
authenticity of the event.

5\. \*\*Transmission via RPC\*\*: The event is then transmitted to a
client-connected node using Remote Procedure Call (RPC) protocols.

6\. \*\*Routing Event Based on StreamId\*\*: Upon receipt, the node
routes the event to a responsible node. This is determined through a
Stream Registry lookup of the specific StreamID associated with the
event.

7\. \*\*Validation by Responsible Node\*\*: The responsible node
performs several checks: it validates the event signature, verifies
entitlements, and conducts other consistency checks, including verifying
the reference to the recent mini block hash, as dictated by the protocol
settings.

8\. \*\*Propagation or Rejection\*\*: If the event passes all checks,
the responsible node propagates it to other nodes associated with the
same StreamId. If the event fails any check, it is rejected.

9\. \*\*Reception and Verification by Other Nodes\*\*: Other nodes
receiving the propagated event repeat the validation checks. Future
updates may allow for the postponement of these checks when a validation
gadget is active.

10\. \*\*Local Commitment and Mini-Pool Placement\*\*: Each node commits
the event to its local storage and places it in the mini-pool data
structure for the respective stream. The order of events in mini pools
may vary across responsible nodes, with reconciliation occurring at the
time of mini block creation.

11\. \*\*Mini Block Creation\*\*: In sync with the river chain block
time, open mini pools are visited to produce a mini block. This process
is integral to maintaining the continuity

\# Overview Source:
https://docs.towns.com/towns-messaging-protocol/stream-nodes/overview

\## Introduction

Stream Nodes are a crucial component of the Towns Messaging Protocol,
acting as the backbone of its decentralized messaging system. This
overview provides insights into the functionalities, responsibilities,
and importance of Stream Nodes within the protocol.

\## Key Functionalities of Stream Nodes

Stream Nodes perform several vital functions in the Towns Messaging
Protocol:

\### Message Processing

\* \*\*Acceptance and Validation\*\*: Stream Nodes are responsible for
accepting encrypted messages from users, validating them against
established protocol rules. \* \*\*Storage and Management\*\*: They
manage the storage of messages, ensuring their availability and
integrity.

\### Mini-Block Creation

\* \*\*Mini-Block Assembly\*\*: Stream Nodes play a key role in creating
mini-blocks, which are collections of messages or events linked
together. \* \*\*Consensus Participation\*\*: They participate in the
consensus process to agree on the contents of each mini-block.

\### Network Synchronization

\* \*\*Stream Management\*\*: Stream Nodes manage chunks of streams,
ensuring that messages are properly sequenced and distributed. \*
\*\*Node Collaboration\*\*: They collaborate with other Stream Nodes to
maintain the consistency and continuity of message streams.

\## Integration with Towns Chain

Stream Nodes are intricately connected to the Towns Chain, enhancing the
protocol\'s functionality:

\* \*\*Chain Interaction\*\*: They interact with the Towns Chain for
various operations, including node registration and mini-block hash
commitments. \* \*\*Decentralized Architecture\*\*: As part of the
decentralized infrastructure, Stream Nodes contribute to the robustness
and security of the Towns Messaging Protocol.

\# Stream Allocation Source:
https://docs.towns.com/towns-messaging-protocol/stream-nodes/stream-allocation

\# Stream Allocation on Towns Protocol

Stream Allocation is a core component of the Towns Protocol, providing a
robust and efficient mechanism for managing streams. This document
outlines the key principles and processes that govern stream allocation
within the Towns ecosystem.

\## Principles of Stream Allocation

1\. \*\*Base Mainnet and Towns Chain Authority\*\*

\* \*\*Base Mainnet Authority\*\*: Base Mainnet is the authoritative
layer for channels and spaces. \* \*\*Towns Chain Authority\*\*: The
Stream Registry on the Towns Chain serves as the authority for the
allocation of other streams.

2\. \*\*User Stream Creation and Verification\*\*

\* \*\*User Stream Inception\*\*: User streams are initiated with a
verifiable signature from the user. This ensures that each stream is
securely linked to the initiating user. \* \*\*Channel Stream
Inception\*\*: Channel streams are initiated by a client but verified by
the existence of the channel already having been created on Base in the
Space contract. \* \*\*Signature Requirement\*\*: A verifiable signature
from the user is mandatory to create a direct message (DM) stream for
them.

3\. \*\*Stream Allocation Process\*\*

\* \*\*Deterministic Allocation\*\*: Stream allocation is deterministic,
based on the Towns Chain block number, randomness, and the list of
active nodes. \* \*\*Replication Standard\*\*: Streams are replicated to
the default protocol replication setting of 5. This ensures redundancy
and reliability in stream data.

4\. \*\*Workload Equality Among Nodes\*\*

\* \*\*Equal Work Distribution\*\*: Over time, each node is expected to
perform roughly the same total amount of work, despite operating on
different individual streams. \* \*\*Adaptive Workload\*\*: The system
adjusts the allocation of streams to maintain workload equality among
nodes.

5\. \*\*Stream Rebalancing\*\* \* \*\*Rebalancing on Node
Joining/Leaving\*\*: Streams are rebalanced when nodes join or leave the
network. \* \*\*Adding New Nodes\*\*: Some stream replicas are added to
new nodes to ensure they become equal participants in the system. \*
\*\*Handling Node Departure\*\*: Similarly, stream replicas are adjusted
when nodes leave to maintain the balance and integrity of the system.

\## Implementation Guidelines

\* \*\*Ensuring Fair Distribution\*\*: Implement mechanisms to monitor
and adjust the distribution of streams among nodes to ensure fairness
and efficiency. \* \*\*Secure Signature Verification\*\*: Implement
robust methods for verifying user signatures during stream creation,
especially for DM streams. \* \*\*Dynamic Rebalancing Logic\*\*: Develop
and integrate dynamic rebalancing logic that responds to changes in the
network, such as nodes joining or leaving.

\# Node Registry Source:
https://docs.towns.com/towns-messaging-protocol/towns-chain/node-registry

\## Overview and Functionality

The Node Registry primary function is to manage the lifecycle of nodes
--- from their onboarding to their operational monitoring. This includes
a rigorous registration process, ensuring that each node adheres to the
network\'s stringent standards for performance and reliability. In
essence, the Node Registry acts as the gatekeeper, maintaining the
network\'s integrity and efficiency.

\### Registration and Verification

At the heart of the Node Registry is the registration and verification
process. New nodes are onboarded through a procedure that evaluates
their compliance with specific performance and security standards. This
process is crucial, as it maintains the high caliber of the network\'s
infrastructure, ensuring that each node is capable and trustworthy.
Requirements are able to evolve over time and adapt to incentives
created by the protocol and demand for more operators.

\### Node Management and Performance Monitoring

Once integrated into the network, nodes are continuously monitored for
their performance and activity. This ongoing surveillance serves
multiple purposes: it ensures that nodes remain operational and
efficient, and it also provides critical data for network health
assessments. The Node Registry\'s role in node management is pivotal in
upholding the network\'s robustness and responsiveness.

\### Deployment

The Node Registry is deployed on Base so that it can easily interact
with both cross-chain entitlement contracts and governance contracts
that also live on Base. Required information is subsequently bridged
back and forth between Base and Towns Chain.

\## Integration and Role within the Towns Chain

The Node Registry is not an isolated entity; it is deeply integrated
into the Towns Chain\'s fabric. Implemented as a smart contract, it
leverages the blockchain\'s inherent characteristics of immutability and
transparency. This integration is vital for several reasons:

\* \*\*Coordination with Stream Registry\*\*: The Node Registry works
closely with the Stream Registry, ensuring a harmonious and efficient
allocation of nodes to various streams within the Towns Messaging
Protocol. \* \*\*Upholding Decentralization and Security\*\*: By
managing the nodes in a decentralized manner, the Node Registry
reinforces the network\'s distributed architecture, which is fundamental
for security and resilience.

\# Overview Source:
https://docs.towns.com/towns-messaging-protocol/towns-chain/overview

\## Introduction

Towns Chain is an Ethereum Layer 2 blockchain built on OP-Stack that
serves as the foundation for consensus and data integrity of streams.
This section outlines the key aspects of the Towns Chain, elaborating on
its role, functionality, and significance within the Towns Messaging
Protocol ecosystem.

\## Core Functionality

\### Layer 2 Blockchain

\* \*\*Roll-up to Ethereum\*\*: Towns Chain operates as a Layer 2
solution, rolling up to the Ethereum blockchain, thereby leveraging its
security and trustworthiness while offering enhanced scalability and
efficiency. \* \*\*OP-Stack\*\*: The chain is built on OP-stack getting
the benefits of a battle tested Ethereum L2 stack with a future path of
interoperability

\### Smart Contract Integration

\* \*\*Stream Registry Contract\*\*: Manages the allocation and
operation of Stream Nodes, central to the messaging process. \* \*\*Node
Registry Contract\*\*: Facilitates the registration and management of
nodes within the network, ensuring a reliable and distributed node
infrastructure.

\## Scalability and Efficiency

\* \*\*High Throughput\*\*: Designed for handling a large volume of
messaging data with minimal latency, ensuring a seamless user
experience. \* \*\*Resource Optimization\*\*: By operating as a Layer 2
solution, Towns Chain maintains low transaction costs and efficient
resource usage, crucial for sustainable operation.

\# Stream Registry Source:
https://docs.towns.com/towns-messaging-protocol/towns-chain/stream-registry

\## Stream Node Allocation and Management

The Stream Registry is the canonical authority and provides the topology
of stream locations and state in the Towns protocol. At the core of the
Stream Registry\'s functionalities lies the dynamic allocation of Stream
Nodes. This process is vital for ensuring an equitable and efficient
distribution of network load across various streams. The registry acts
as a central ledger, tracking the status and associations of Stream
Nodes with specific message streams. This systematic management is
pivotal in maintaining a well-organized and smoothly operating messaging
network.

In a system governed by a stream registry, the canonical state is a
critical component that serves as a reference point for all participants
to reconcile their internal state. This means that every individual
stream within the system must be accounted for in the stream registry,
ensuring a comprehensive and up-to-date overview of the system\'s
current status. Nodes, which are integral parts of this system, are
endowed with the authority to write new streams into the registry. This
process occurs whenever a new stream is created. Importantly, the
creation of each stream is not arbitrary; it necessitates a justified
reason.

The Stream Registry is deployed as an upgradeable smart contract to
Towns Chain \\\[see\].

\## Role in Consensus and Security

The Stream Registry plays a significant role in achieving consensus
among Stream Nodes regarding the state of various message streams. This
consensus mechanism is a cornerstone for the integrity and security of
the network. By overseeing node allocation, the Stream Registry directly
contributes to enhancing the overall security and operational coherence
of the messaging system.

\## Scalability and Flexibility

A notable attribute of the Stream Registry is its adaptability in node
allocation, a feature that significantly bolsters the scalability of the
Towns Messaging Protocol. This adaptability is crucial in accommodating
the fluctuating demands of the network. Moreover, the Stream Registry
exhibits a high degree of flexibility in handling a diverse array of
message streams, each with its unique set of requirements and
characteristics, underscoring its versatility and capacity to manage
complex network dynamics.

\# Smart Contracts Source:
https://docs.towns.com/towns-smart-contracts/contracts

\## Key Smart Contracts

Towns smart contracts are deployed using the Diamond Pattern (see
\[EIP-2535\](https://eips.ethereum.org/EIPS/eip-2535)), which improves
upon modularity and upgradeability.

The following is the current list of deployed diamond contracts on Base
and a link to their associated facet addresses.

\| Diamond \| Network \| Address \| Facet Addresses \| \|
\-\-\-\-\-\-\-\-\-\-\-- \| \-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| SpaceFactory \| Base \| 0x9978c826d93883701522d2CA645d5436e5654252
\| \[Louper
Link\](https://louper.dev/diamond/0x9978c826d93883701522d2CA645d5436e5654252?network=base)
\| \| SpaceOwner \| Base \| 0x2824D1235d1CbcA6d61C00C3ceeCB9155cd33a42
\| \[Louper
Link\](https://louper.dev/diamond/0x2824D1235d1CbcA6d61C00C3ceeCB9155cd33a42?network=base)
\| \| Space \| Base \| 0x34f35E1ECA9C00791bF8121A01c20977d8bEB11C \|
\[Louper
Link\](https://louper.dev/diamond/0x34f35E1ECA9C00791bF8121A01c20977d8bEB11C?network=base)
\| \| BaseRegistry \| Base \| 0x7c0422b31401C936172C897802CF0373B35B7698
\| \[Louper
Link\](https://louper.dev/diamond/0x7c0422b31401C936172C897802CF0373B35B7698?network=base)
\|

\## Accessing and Interacting with the Contracts

These addresses provide direct access to the deployed contracts on Base.
Developers and users of the Towns ecosystem can interact with these
contracts for various purposes, including creating new Spaces, managing
memberships, and implementing pricing strategies.

\# Overview Source:
https://docs.towns.com/towns-smart-contracts/overview

Towns Smart Contracts are the cornerstone of the Towns ecosystem,
establishing a robust framework for the creation, management, and
interaction with digital communities, referred to as 'Spaces', on the
blockchain. These contracts are deployed on \[Base
Mainnet\](https://base.org), an Ethereum Layer 2 solution optimized for
scalability and efficiency.

\## Unique Contract Addresses for Each Space

\* \*\*Distinct Operations and Governance\*\*: Each Space within the
Towns ecosystem is equipped with a unique contract address. This
individualized approach allows for distinct operations, governance, and
interactions, ensuring that each Space maintains its unique identity and
operational structure.

\## Advantages of Towns Smart Contracts

\* \*\*Programmability\*\*: Towns Smart Contracts allow every aspect of
Spaces to be fully programmable. Developers can create sophisticated
membership gating based on token balances, NFTs, or on-chain activity;
implement dynamic pricing and automated subscriptions; deploy bots to
enhance community interactions; and integrate seamlessly with other Web3
applications and decentralized finance (DeFi) protocols, unlocking new
possibilities for on-chain community engagement. \* \*\*Scalability and
Efficiency\*\*: By leveraging Ethereum Layer 2 solutions, Towns Smart
Contracts significantly enhance the scalability of operations. This
ensures that the increasing demands of digital communities are met
without compromising on performance. \* \*\*Reduced Transaction
Costs\*\*: The use of Layer 2 solutions also plays a pivotal role in
reducing transaction costs, making it more economical for users to
interact within the Towns ecosystem. \* \*\*Enhanced Security and
Transparency\*\*: Smart contracts inherently provide a secure and
transparent framework for digital interactions. The immutable nature of
blockchain technology, combined with smart contract transparency,
fosters a trustworthy environment for all users. \* \*\*Automated
Governance\*\*: These contracts facilitate automated governance
mechanisms. This automation ensures that the rules and protocols defined
for each Space are consistently and impartially enforced.

\## Deployment on Base Mainnet Chain

Towns Smart Contracts are deployed on Base Mainnet.

\* \*\*High Performance\*\*: The Base Mainnet Chain is designed for high
performance, crucial for the efficient operation of the Towns Smart
Contracts. \* \*\*Lower Transaction Costs\*\*: Operating on this chain
also ensures lower transaction costs, an essential factor for
facilitating frequent and varied interactions within the Towns
ecosystem. \* \*\*Security\*\*: Base Mainnet is built as an Ethereum L2
using Optimism. Blocks roll up to Ethereum Mainnet, deriving the
security of one of the most secure public blockchain networks.

\# Pricing Modules Source:
https://docs.towns.com/towns-smart-contracts/pricing-modules

\## Overview

In the Towns ecosystem, Spaces have the flexibility to define their own
pricing strategies through custom pricing modules. These modules are
smart contracts that comply with the \`IPricingModule\` Interface and
are responsible for determining the price of memberships based on
various attributes.

\## Implementation of Custom Pricing Modules

To implement a custom pricing module, a contract must adhere to the
\`IPricingModule\` Interface. This interface includes the \`getPrice\`
function, which can be programmed to calculate prices based on different
criteria, such as the total number of memberships minted or other
programmable attributes. See more examples in \\\[Recipes\].

\### Default Pricing Modules in Every Space

Every newly deployed Space in the Towns ecosystem is equipped with two
default pricing modules:

1\. \*\*Dynamic Pricing Module\*\* (default setting):

\* \*\*Pricing Strategy\*\*: This module adopts a dynamic pricing
approach, where the price is influenced by the number of members in the
Space. \* \*\*Price Calculation\*\*: The price logarithmically
approaches \\\$10 USD as membership reaches 1,000, and then again
increases logarithmically to approach \\\$100 USD as membership reaches
10,000. \* \*\*Price Cap\*\*: Membership prices never exceed \\\$100
USD. \* \*\*Initial Offer\*\*: The first 100 memberships are offered for
free. \* \*\*Payment Method\*\*: Accepts ETH as payment. \*
\*\*Reference\*\*: For more details, see \`DynamicPricing.sol\`.

2\. \*\*Flat Fee Price\*\*: \* \*\*Fixed Pricing\*\*: This module
implements a straightforward fixed pricing strategy. \* \*\*Minimum
Price\*\*: Sets a minimum price of \\\$10 USD for a membership. \*
\*\*Payment Method\*\*: Also accepts ETH as payment.

\## Transaction Fee Distribution

An essential aspect of the pricing modules is the distribution of fees
from transactions. These fees are split among key stakeholders:

\* \*\*Space Owner\*\*: A portion of the fees is allocated to the
SpaceOwner, providing an incentive for maintaining and growing the
Space. \* \*\*Towns Community\*\*: At present, a share of fees
contribute to the \*\*River Eridanus Association\*\*, supporting the
overall development and sustainability of the ecosystem. Upon
implementation of they buy-and-burn function, the remaining fees will be
contributed to the \[Towns Lodge\](https://townslodge.com) giving TOWNS
tokenholders the decision on how to deploy those funds to further the
Towns Protocol. \* \*\*Referrers\*\*: Referrers, if any, are also
rewarded, encouraging community growth and engagement. Referrers can be
set for both members of a Space as well as for the client being used to
interact with the protocol.

\*\*Note\*\*: Free Spaces do not incur protocol fees on membership
transactions (joining or renewing). Tipping within any space (free or
paid) incurs a separate protocol fee on member tips, while bot tips have
no protocol fee.

\# Roles and Entitlements Source:
https://docs.towns.com/towns-smart-contracts/roles-entitlements

Understanding Roles, Entitlements, and Permissions in Towns Protocol

In the Towns ecosystem, \`Permissions\` are defined actions that users
can undertake within a \`Space\`. These permissions are fundamental to
governing user interactions and activities within the ecosystem. The
Towns system includes a range of permissions, each tailored to specific
functionalities:

\* \*\*Read\*\*: Allows users to access and view message content within
a Space. \* \*\*Write\*\*: Allows users to create and modify message
content within a Space. \* \*\*React\*\*: Allows users to add reactions
to messages. \* \*\*AddRemoveChannels\*\*: Allows users to create and
delete channels within a Space. \* \*\*ModifyChannel\*\*: Allows users
to edit channel settings. \* \*\*ModifySpaceSettings\*\*: Allows users
to change Space settings. \* \*\*ModifyRoles\*\*: Allows users to
create, update, and delete roles and entitlements within a Space. \*
\*\*ModifyBanning\*\*: Allows users to ban and unban members from a
Space.

\## Concept of Roles

\`Roles\` in the Towns system are aggregations of the aforementioned
\`Permissions\`. By combining different permissions into distinct roles,
the system simplifies the management of user capabilities and access
within a Space.

\## Functionality of Entitlements

\`Entitlements\` play a crucial role in determining user eligibility for
different Roles. They dictate how users qualify for certain Roles and
can be specific to different Channels or the Space itself.

\## Implementation of Entitlement Modules

\`Entitlement Modules\` are instrumental in defining the requirements
for Entitlements. These modules are akin to pricing modules, allowing
for the deployment of bespoke smart contracts on the chain. To be
incorporated into the Towns system, these contracts must adhere to the
\`IEntitlement\` Interface and be deployed to Base, with their settings
adjusted for each Space.

\## Default Settings in Spaces

Upon the minting of a new Space, the Towns system automatically deploys
two standard Entitlement Modules:

1\. \*\*UserEntitlementModule\*\*: This module enables the assignment of
Roles based on specific addresses or ENS. For instance, \"vitalik.eth\"
could be assigned the Moderator Role, while \"0x44..ccbb\" might receive
a Read-Only Role. 2. \*\*TokenEntitlementModule\*\*: It facilitates the
assignment of Roles based on the ownership of certain assets on-chain.
An example would be assigning a Special Role to users holding a
Cryptopunk or a Whale Role to those with at least .1 ETH.

\## Default Roles in Newly Minted Spaces

Each newly minted Space in the Towns system is initialized with two
predefined Roles:

\*\*Owner\*\* - Assigned automatically to the address holding the Owner
NFT through the Token Entitlement Module. This Role encompasses all
permissions within the Space and is irrevocable.

\*\*Member\*\* - Granted to any address holding a Member NFT. By
default, this Role includes \"Read\" and \"Write\" Permissions, allowing
for basic interaction within the Space.

\# Space Membership Source:
https://docs.towns.com/towns-smart-contracts/space-membership

Space Membership in Towns Protocol is built on Membership
Tokens---on-chain assets that grant holders defined rights and
capabilities within individual Spaces. These tokens serve as a gateway,
enabling their holders to participate actively, access exclusive
features, and engage in various interactions determined by each Space\'s
unique rules and configuration.

\*\*Subscription Model:\*\* Memberships are initially defined with a 1
year expiry, while still allowing renewal at the original price that it
was purchased rather than the current market price for a new membership.
This prevents early members of a Space from getting priced out and
provides additional value to the membership token itself.

\*\*Configurable Supply:\*\* The supply of Membership Tokens is under
the direct control of the Space owner. This feature allows for the
customization of the Space'\'s exclusivity, tailoring the community size
to the owner\'s vision.

\*\*Flexible Pricing Models:\*\* Pricing for these tokens is highly
versatile. Space owners can set fixed prices or implement any custom
pricing scheme that can be articulated through code. For further details
on the pricing structure, refer to the \\\[Pricing Modules\] section.

\*\*Access Control Mechanisms:\*\* Membership Tokens can be gated based
on the possession of specific
\[ERC-20\](https://eips.ethereum.org/EIPS/eip-20) or
\[ERC-721\](https://eips.ethereum.org/EIPS/eip-721) tokens across
multiple networks including Ethereum Mainnet, Optimism, Polygon,
Arbitrum, and Base. This creates a flexible and inclusive gating system.

\*\*Custom Entitlement Logic:\*\* In addition to standard ERC20/721 and
address gating mechanisms, Membership Tokens can also incorporate custom
logic. For example channels rules can be composed based on the current
score of an on-chain game or the liquidity in a defi protocol. Combining
this with on-chain oracles allows for even greater flexibility to gate
based on real-world events. This logic can be coded and deployed on any
of the supported chains, offering a higher degree of customization for
access control. For more information, see \\\[Entitlement Modules\].

\*\*Reputation System:\*\* Within a Space, Membership Tokens have the
unique ability to accrue reputation from other members. This feature
fosters a community-driven environment where member interactions
contribute to one's standing in the Space. For detailed insights, refer
to the \\\[Reputation\] section.

\*\*Token Standards and Composability:\*\* Membership Tokens align with
the \[ERC-721\](https://eips.ethereum.org/EIPS/eip-721) standard. This
adoption ensures seamless integration and interoperability with other
blockchain components, making them easily composable within the wider
ecosystem.

\# Space Ownership Source:
https://docs.towns.com/towns-smart-contracts/space-ownership

Space Ownership in Towns is designed with a unique approach emphasizing
direct and transferable control over Spaces through a specially minted
token. This section outlines the intricacies of Space Ownership,
focusing on fund management, ownership transfer, and enhanced security
features.

\## Creation and Ownership

\* \*\*Token Minting\*\*: Upon the creation of a Space on Base, the
creator is awarded a special on-chain token. This token is not merely
symbolic; it confers complete ownership over the corresponding Space. \*
\*\*Ownership Rights\*\*: Space contracts are pre-configured to
recognize the holder of this token as the Owner. This design choice
introduces flexibility in ownership, allowing the token to be
transferred or controlled by decentralized entities like a DAO or a
multisig wallet.

\## Financial Management

\* \*\*Funds Management\*\*: The process of Membership minting channels
all funds directly to a contract. This contract is wholly controlled by
the ownership NFT. Access to these funds is granted through direct
ERC-721 ownership validation, providing the NFT holder with exclusive
financial control.

\## Transfer and Security

\* \*\*Space Sale\*\*: The ownership model facilitates the transfer of
ownership rights. Owners can sell their Space by simply transferring
their NFT, effectively passing on all ownership privileges. \*
\*\*Enhanced Security\*\*: For added security and collective management,
Spaces can be stored in multisig wallets or managed by other DAO
structures. This arrangement allows multiple parties to partake in the
control and decision-making processes of the Space. \* \*\*Guardian
Module\*\*: Prevents the Owner token from being transferred immediately
in case of holding wallet compromise. \* \*\*Interface
Implementation\*\*: The Space Owner NFT implements
\[ERC-721\](https://eips.ethereum.org/EIPS/eip-721), ensuring compliance
with established standards and facilitating interoperability within the
blockchain ecosystem.

\## Additional Resources

\* For more detailed technical information, please refer to the
\\\[Space Contract Interface\].

\# Upgradeability Source:
https://docs.towns.com/towns-smart-contracts/upgradeability

The Diamond Pattern with Facets

In the blockchain and smart contract realm, the \[Diamond
Pattern\](https://eips.ethereum.org/EIPS/eip-2535) emerges as a
sophisticated solution for contract upgradeability. This pattern is
designed to overcome the limitations of traditional smart contract
systems, where deployed contracts are immutable and cannot be upgraded.
The Diamond Pattern, also known as
\[EIP-2535\](https://eips.ethereum.org/EIPS/eip-2535), introduces a
modular structure using \'facets\', which allows for more flexible and
manageable contract upgrades. Spaces meanwhile always retain the right
to opt out of upgrades and always fully retain control ownership and
funds.

\## Understanding Facets

Facets are individual, modular contracts that together form the complete
Diamond. Each facet can contain a specific set of functionalities or
logic. The beauty of this approach lies in its compartmentalization;
facets can be added, replaced, or removed without affecting the entire
system.

\## The Role of the Diamond Proxy

At the core of the Diamond Pattern is the Diamond Proxy. This is a
single proxy contract that delegates calls to the appropriate facets.
The Diamond Proxy maintains the state and delegates function calls to
specific facets that implement these functions. This setup enables the
core logic of the Diamond to be updated or expanded by modifying its
facets.

\## Benefits of the Diamond Pattern

1\. \*\*Upgradeability\*\*: The most significant advantage of the
Diamond Pattern is the ability to upgrade smart contracts. Facets can be
replaced or updated, allowing for improvements and bug fixes
post-deployment.

2\. \*\*Modularity\*\*: By dividing functionality into different facets,
the system becomes more organized and manageable. This modular approach
also aids in understanding and auditing the contract\'s code.

3\. \*\*Gas Efficiency\*\*: The Diamond Pattern can be more
gas-efficient compared to other upgradeable contract systems. Since only
the facets are upgraded, the gas costs associated with deploying large
contracts are significantly reduced.

4\. \*\*Enhanced Functionality\*\*: The pattern allows for a broad range
of functionalities to be implemented, which might not be possible in a
single contract due to block gas limits.

\## Implementing the Diamond Pattern

Implementing the Diamond Pattern requires careful planning:

\* \*\*Designing Facets\*\*: Determine the functionalities to be
encapsulated in each facet. This division should be logical and
efficient. \* \*\*Managing State\*\*: Ensure that the Diamond Proxy
effectively manages the state across all facets. \* \*\*Security
Considerations\*\*: Given its complexity, the Diamond Pattern demands
rigorous testing and auditing to prevent security vulnerabilities.

\# Claiming Rewards Source: https://docs.towns.com/towns-token/claiming

\## Claim Process

At the end of each distribution period, addresses that are delegating or
designated as \[Authorized Claimers\](./delegation) can claim their
rewards.

\## Claim Execution

Rewards are claimed by calling the \`claimReward(address beneficiary,
address recipient)\` function on the
\[RewardsDistribution\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/src/base/registry/facets/distribution/v2/RewardsDistribution.sol)
contract, which transfers the tokens to the recipient\'s wallet.

The \`claimReward\` function is called from the claimer address, who is
either the beneficiary or an authorized claimer that can claim the
reward for the beneficiary.

\<Note\> Since the RewardsDistribution contract is a facet of the
BaseRegistry contract, the \`claimReward\` function is called from the
BaseRegistry contract address (see
\[contracts\](/node-operator/contracts)). \</Note\>

To view the current reward claimable by \`claimReward\` in wei, call
\`currentReward(address beneficiary)\` on the RewardsDistribution
contract from the BaseRegistry diamond contract.

The following example shows how to call \`currentReward\` from the
BaseRegistry diamond contract with \`cast\`:

\`\`\` cast call \\ \--rpc-url \$BASE_RPC_URL \\
\"0x7c0422b31401C936172C897802CF0373B35B7698\" \\
\"currentReward(address)(uint256)\" \\
\"0xa4742402D6E314a069CeB1c3C2C4eFb2982d7D44\"

37995641418907243501899 \[3.799e22\] \`\`\`

\<Note\> To convert the current reward to base token units from wei,
divide the result by \`1e18\`. \</Note\>

\# Economics Source: https://docs.towns.com/towns-token/economics

\## Inflationary Mechanism

\* \*\*Annual Inflation Rate\*\*: The TOWNS token features an annual
inflation rate of 8% beginning after year 1, which is programmed to
decrease linearly over a period of 20 years, reaching a final inflation
rate of 2%. This gradual reduction is intended to decrease the rate of
new token issuance over time, aligning with the expected maturation and
growth of the network. The DAO can vote to lower inflation only.

\* \*\*Epoch-Based Distribution\*\*: Inflation rewards are distributed
bi-weekly to all active Node Operators in the system. Each operator
receives rewards proportionally based on the total tokens staked to
their nodes. Operators retain their defined commission, after which the
remaining rewards are passed to delegators. Delegators then receive
their portion of rewards proportional to the number of tokens they have
staked with that operator.

\## Reward Allocation and Fees

\* \*\*Node Operator Fees\*\*: Each Node Operator has the ability to set
a percentage fee for their services. This fee is subtracted from the
total inflation rewards allocated to the Node Operator for the epoch.

\* \*\*Distribution to Delegators\*\*: After the deduction of the Node
Operator\'s fee, the remaining inflation rewards are distributed
pro-rata among the delegators of that Node Operator. This mechanism
ensures that both Node Operators and their delegators are rewarded for
their contribution to the network\'s security and operability.

\# Mechanics Source: https://docs.towns.com/towns-token/mechanics

\## Deployment and Initial Supply

TOWNS is deployed as an ERC20 token on the Ethereum Mainnet with an
initial supply of 10 billion tokens.

\## Inflation Process

\* \*\*Annual Inflation\*\*: TOWNS\'s supply is inflated once per year
through a publicly callable function ensuring a predictable increase in
token supply. This inflation rate can only be lowered via an onchain
governance vote. \* \*\*Minting\*\*: This inflation process involves
minting new tokens, with the total amount being that one years value of
inflation.

\## Distribution on Base

\* \*\*Bridging to Base\*\*: TOWNS tokens are distributed on the Base
blockchain. Tokens are minted via the inflation function on the mainnet
Towns contract and bridged via the Base Standard Bridge to the origin
contract of the Towns Treasury contract which supplies the Rewards
Distribution contract. \* \*\*Distribution Contract\*\*: The
distribution contract on Base must be invoked once per claim cycle. This
contract is responsible for allocating rewards based on various factors,
including the active Node Operators, their set percentage fees, and the
distribution of delegated tokens.

\## Reward Allocation and Claiming

\* \*\*Claim Cycles\*\*: Tokens are supplied to the Distribution
contract on a biweekly cadence and tokens are claimable via the
Distribution contract at any time by the beneficiary or authorized
claimer specified when staking. \* \*\*Signaling and Reward
Adjustment\*\*: The protocol incorporates a signaling mechanism for bad
node behavior. Reports from other nodes and the DAO regarding misconduct
or underperformance will be considered in the reward allocation process,
ensuring that rewards are distributed fairly and incentivize good
behavior.

\# Staking Source: https://docs.towns.com/towns-token/staking

\### Staking Process

The Towns token can be staked on Base to contribute to the security and
decentralization of the Towns proof-of-stake network. Any holder of
Towns tokens can participate by delegating their tokens to node
operators within the ecosystem. Staking can be done directly on the
contracts or via an interface at
\[towns.com/token\](https://towns.com/token).

Rewards for staking are continuously accrued and distributed on a
biweekly schedule. Each operator receives rewards proportionally based
on the total tokens staked to their node. Operators retain a defined
commission, after which the remaining rewards are passed to delegators.
Delegators then receive their portion of rewards proportional to the
number of tokens they have staked with that operator.

Delegators rewards can be claimed at any time. Upon initiating an
unstaking request, a 30-day cooldown period is enforced before the
staked tokens become fully withdrawable.

\### Staking Contracts

Staking is handled by the v2 version of the
\[RewardsDistribution\](https://github.com/towns-protocol/towns/blob/main/packages/contracts/src/base/registry/facets/distribution/v2/IRewardsDistribution.sol)
contract.

External methods from RewardsDistribution can be called from the
BaseRegistry diamond contract directly using any ethereum compatible
client such as \[cast\](https://getfoundry.sh/cast/overview/).

The BaseRegistry diamond is deployed on Base (see
\[contracts\](/node-operator/contracts)).

\### Staking Execution

\<Warning\>Though we illustrate programmatic instructions below,
interacting with the staking contract is best performed through the
staking site available in
\[www.towns.com/token\](https://www.towns.com/token).\</Warning\>

\#### Basic Staking

To stake, the user must call the \`stake(uint96 amount, address
delegatee, address beneficiary)(uint256 depositIds)\` method of the
RewardsDistribution facet from the BaseRegistry diamond contract.

Users must select a delegatee, for instance an active operator (active
operators are listed on
\[www.towns.com/token\](https://www.towns.com/token)), to delegate to in
order to earn periodic rewards.

Users must also select a beneficiary, which is the address that will
receive the rewards.

Once \`stake()\` is called, a unique \`depositId\` is returned to track
the stake for the owner. A given address can have multiple deposits or
can manage a single deposit.

To increase the amount of stake, the deposit owner can call
\`increaseStake(uint256 depositId, uint96 amount)\`.

\<Note\>Users can switch their delegatee at any time without withdrawing
their stake by calling \`redelegate(uint256 depositId, address
delegatee)\`.\</Note\>

\#### Advanced Staking Methods

\*\*Gasless Staking with Permits\*\* For users who want to stake without
paying gas for token approvals:

\* \`permitAndStake(uint96 amount, address delegatee, address
beneficiary, uint256 nonce, uint256 deadline, bytes signature)\` \*
\`permitAndIncreaseStake(uint256 depositId, uint96 amount, uint256
nonce, uint256 deadline, bytes signature)\`

\*\*Staking on Behalf of Others\*\* Authorized users can stake on behalf
of others using:

\* \`stakeOnBehalf(uint96 amount, address delegatee, address
beneficiary, address owner, uint256 nonce, bytes signature)\`

\*\*Managing Your Stakes\*\*

\* \`changeBeneficiary(uint256 depositId, address newBeneficiary)\` -
Change who receives the rewards from a specific deposit

\#### Claiming Rewards

Rewards can be claimed at any time using the \`claimReward(address
beneficiary, address recipient)\` method:

\*\*For Regular Stakers:\*\*

\* Call with \`beneficiary = your_address\` to claim your own staking
rewards \* You can send rewards to any \`recipient\` address (yourself
or someone else)

\*\*For Node Operators:\*\* Operators can claim both:

1\. \*\*Their own staking rewards\*\* (if they\'ve staked tokens) 2.
\*\*Commission rewards\*\* from users who delegated to them

\#### Withdrawing Stake

To withdraw stake, the owner of the depositId should follow the below
steps or use the staking site available in
\[towns.com\](https://www.towns.com/token).

1\. Call \`getDepositsByDepositor(address depositor)\` to get the list
of depositIds for the depositor. 2. Call \`initiateWithdraw(uint256
depositId)\` with the depositId to start the withdrawal process. 3. Wait
for the withdrawal to be processed subject to token lockup period. 4.
Call \`withdraw(uint256 depositId)\` to complete the withdrawal process
transferring the stake back to the owner.

\# Utility Source: https://docs.towns.com/towns-token/utility

\## Overview

Towns Token serve multiple purposes that include delegation to Node
Operators, Space address delegation, and governance participation.

\## Delegation to Node Operators

\* \*\*Node Operator Delegation\*\*: Towns Tokens are delegated to Node
Operators, who are essential for the network\'s operation. To be
approved by the \[Towns Lodge\](https://townslodge.com) and operate,
Node Operators must secure a minimum delegation amount, ensuring they
have sufficient stake in the network\'s success and security.

\* \*\*Delegation Period\*\*: Once delegated, Towns Tokens become
non-transferable for a 30-day cooling-off period. This lock-in period
starts from the moment the \`unstake()\` function is called. This
restriction is in place to maintain network stability, allowing adequate
time for nodes to rebalance their stream data following a reduction in
their delegated tokens below the minimum requirement, leading to their
potential exit from the network.

\## Space Address Delegation

\* \*\*Direct and Space Delegations\*\*: Delegation can be directed
either to the Node Operator\'s address or to any valid Space address
within the network. Spaces, in turn, can redirect their delegated tokens
to any specific Node, providing flexibility in delegation strategies.

\* \*\*Voting Power and Delegation\*\*: Delegating tokens to a Space
allows the Space to retain its voting power in governance decisions
while still contributing to a Node Operator\'s required delegation.
Conversely, tokens directly delegated to a Node Operator not only count
towards their operational stake but also transfer governance power to
them.

\* \*\*Enhanced Features\*\*: Spaces with enough delegation will unlock
enhanced features at the protocol level. Spaces can get additional
storage retention of their data or set custom pricing modules that can
allow members to join for free by having enough tokens delegated to
them.

\## Governance Participation

\* \*\*Voting with Towns Tokens\*\*: In addition to their role in
delegation and network operation, Towns Tokens are instrumental in the
governance of \[Towns Lodge\](https://townslodge.com). Token holders can
participate in decision-making processes, influencing the direction and
policies of the \[Towns Lodge\](https://townslodge.com).

\* \*\*Balancing Delegation and Governance\*\*: The dual utility of
Towns Tokens in both delegation and governance allows for a balanced
ecosystem where token holders can support network operations while
actively engaging in its democratic processes.

\# MiCA Whitepaper Source:
https://docs.towns.com/white-paper/mica-whitepaper

\# Towns Protocol Technical Whitepaper Source:
https://docs.towns.com/white-paper/technical-whitepaper

Comprehensive technical whitepaper covering Towns Protocol\'s
architecture, cryptographic methodologies, consensus mechanisms,
economic model, and governance structure for decentralized
communication.

\## Abstract

Communication underpins every aspect of digital life, yet it remains
largely centralized, leaving users dependent on platforms prone to
censorship, manipulation, and limited economic participation. The Towns
Protocol leverages blockchain technology to redefine digital
communication by creating decentralized, secure, and economically
integrated community platforms.

Built with a custom appchain (Towns Chain) and Base, Ethereum\'s
scalable Layer 2 solution, Towns Protocol introduces decentralized
communication through \"Spaces\", user-owned and programmable digital
communities. Each Space employs smart contracts to manage memberships
represented by ERC-721 NFTs, enabling tailored governance, dynamic
access control, and economic interactions directly integrated with
blockchain financial services.

Towns ensures secure messaging via advanced cryptographic methodologies,
including Curve25519 key pairs and AES-GSM encrypted shared session
keys, safeguarding against censorship, spam, and malicious activities.
Nodes within the Towns network validate encrypted messages, achieving
consensus through decentralized miniblock production and integrating
cryptographic proofs directly onto the blockchain for verifiable
immutability and transparency.

An innovative economic model incentivizes robust participation by
rewarding node operators, delegators, community referrers, and space
owners, aligning ecosystem stakeholders through transparent token
economics. Governance of the Towns Protocol is fully on-chain via the
\[Towns Lodge\](https://townslodge.com) DAO, empowering token holders to
propose, discuss, and implement protocol upgrades transparently and
democratically.

\## Introduction

Communication is the most valuable aspect of the internet, underpinning
nearly every facet of digital life---from personal interactions and
community building to critical business operations. Today, centralized
platforms such as Slack, Discord, WhatsApp, Telegram, and WeChat
dominate this essential utility, capturing significant economic and
social value. Decentralized communication technologies represent an
unprecedented opportunity to reclaim a portion of this value, providing
more resilient, secure, and user-governed alternatives.

The evolution of internet communication has passed through distinct
phases: initially limited to text, it expanded into images, then audio
and video, and is now extending to include financial transactions.
Blockchain technology uniquely enables the integration of financial
primitives directly into communication platforms, significantly
enriching interactions and offering new possibilities for digital
communities.

With blockchain infrastructure reaching maturity, it is now possible to
create decentralized communication applications offering user
experiences competitive with centralized services. The Towns Protocol
harnesses this technological advancement, providing a robust, scalable
platform specifically designed to facilitate decentralized
communication.

The benefits of decentralized communication platforms built on
blockchain technology are numerous and impactful:

\* \*\*Global Decentralization\*\*: Operated by a distributed network of
node operators worldwide, Towns ensures resilience against censorship
and centralized shutdowns, safeguarding the freedom of digital
expression and collaboration. \* \*\*Permissionless and
Programmable\*\*: Open and programmable infrastructure allows developers
and users to innovate freely, unlocking infinite potential applications
and extensions without centralized approval. \* \*\*Transparent
Governance\*\*: With rules and protocols transparently encoded into
blockchain smart contracts, governance decisions and operational
mechanisms are clear, auditable, and resistant to manipulation. \*
\*\*Cryptographic Verification of Humanity\*\*: Integrating
cryptographic identity verification directly into the communication
layer ensures genuine user participation, preventing spam, bots, and
other malicious activities. \* \*\*User Ownership and Sovereignty\*\*:
Users truly own their digital spaces via cryptographic on-chain assets
(NFTs), granting them control, transferability, and economic sovereignty
over their communities. \* \*\*Integration with On-Chain Finance\*\*:
Seamlessly merging financial services directly into communication
channels enables novel interaction models, including tipping,
subscriptions, payments, and complex economic interactions, fostering
vibrant digital economies within each decentralized community.

The Towns Protocol addresses the limitations of centralized
communication and the constraints of early decentralized attempts by
delivering a user-friendly, economically integrated, and
censorship-resistant platform designed explicitly for the next
generation of internet communities.

\## System Design

\### Protocol Architecture

The Towns Protocol employs a decentralized architecture consisting of
three primary components:

\#### Spaces

Spaces are programmable communication channels that users can deploy and
manage onchain. Each Space has a unique contract address, allowing
independent operation and governance structures. Key functionalities
include customizable membership management, role-based entitlements, and
moderation tools, all facilitated through specialized smart contracts
deployed on the Base Mainnet, a highly performant Ethereum Layer 2
solution.

\#### Memberships

Memberships are implemented as NFTs adhering to the ERC-721 standard,
providing proof of membership and granting users specific access rights
within Spaces. The supply and pricing of Membership NFTs are
configurable by Space owners, allowing for dynamic or fixed pricing
models and cross-chain token gating mechanisms. Membership tokens can
integrate custom entitlement logic, leveraging on-chain assets or
off-chain data via oracles, ensuring flexible and inclusive access
control.

\#### Streams

Stream is a core abstraction in Towns Protocol. Each stream is
identified by a unique 32-byte id. Each channel, group message session,
space, user, media file are stored in the specific stream. I.e. a single
channel is stored in a single stream with this channel\'s id. Each
stream is replicated to multiple (but not all) nodes. Encrypted messages
are stored into the stream\'s minipool. Every two seconds, if the
minipool is not empty, a new miniblock is produced by one of the
participating nodes through a voting process. The hash and number of the
new miniblock is written in Stream Registry Smart Contract on Towns
Chain. Only one miniblock can be registered in the smart contract for
the given height. Once a hash on the miniblock is stored on the
blockchain, it becomes \"canonical\". By tracking these hashes,
participating nodes and users know which state each stream is supposed
to be in, i.e. what is the \"canonical\" view of each stream.

\#### Nodes

Nodes form the decentralized infrastructure underpinning the Towns
network. Managed by a Node Registry deployed on Base, nodes are
responsible for validating, propagating and storing encrypted messages
across the network. Nodes undergo a rigorous registration and monitoring
process to maintain high operational standards, and their performance is
continuously evaluated to ensure network reliability and security.

\### Consensus and Incentive Mechanisms

The Towns Protocol utilizes a decentralized consensus mechanism built
upon the Layer 2 blockchain (Towns Chain), designed specifically for
scalability and efficiency. Consensus is achieved through synchronized
validation and mini-block production managed by Stream Nodes. These
nodes validate message events, coordinate on their inclusion into
miniblocks, and achieve consensus through a voting mechanism, ensuring
accurate and secure message sequencing.

Incentive mechanisms in the Towns Protocol revolve around clearly
defined token economics. Node operators set commission rates deducted
from periodic inflationary rewards distributed bi-weekly. Rewards are
allocated equally among active operators, adjusted for their set
commissions. Remaining rewards are then proportionally distributed to
delegators, incentivizing active participation and staking.

Economic incentives extend further to encourage robust node operation
and active community participation. Nodes are continually evaluated
based on their operational performance and receive rewards based on
delegated tokens, ensuring alignment of interests across the network\'s
stakeholders and maintaining overall protocol health and reliability.

\## Protocol Specification

\### Operational Mechanics

The operational mechanics of the Towns Protocol delineate a
sophisticated interplay between Ethereum-based smart contracts,
decentralized node operations, and rigorous data stream validation.

\#### Smart Contract Interactions

The Towns Protocol employs Ethereum smart contracts to facilitate
decentralized governance and membership management within distinct
digital communities, referred to as \"Spaces\". Each Space can be
uniquely configured to enforce customized governance rules and community
standards. Membership within these Spaces is represented and managed
through minting ERC-721 compliant NFTs, embedding programmable pricing
and entitlement logic directly within token metadata.

To enhance secure fund management, the Towns Protocol integrates
ERC-6551 token-bound accounts. These accounts securely associate funds
and digital assets directly with individual ownership tokens,
streamlining secure and transparent resource management.

\#### Node Operations

Nodes within the Towns Protocol are responsible for validating,
propagating, and securely managing encrypted communications. Each node
performs critical entitlement checks alongside rigorous cryptographic
verification, thus safeguarding the integrity and authenticity of all
messages within the network.

A deterministic approach governs stream allocation, administered by the
Stream Registry, leveraging the immutable state provided by the
blockchain. Nodes collaboratively coordinate to reach consensus,
performing event validation and systematically constructing miniblocks,
which ensures precise and sequential event logging across the network.

\#### Data Streaming and Validation

Event-driven communication within the Towns Protocol relies upon
encrypted payload transmission. Each event is a part of some stream, and
copies of the event are stored in each stream\'s replicas hosted by
different nodes.

Upon receiving events, nodes execute comprehensive validation checks,
verifying digital signature authenticity, entitlement permissions, and
ensuring coherence with previously validated mini-block hashes.
Validated events are subsequently committed locally to stream-specific
minipools. Nodes put events from minipools into consensus-driven
miniblocks, thus maintaining synchronized state across the decentralized
network and guaranteeing resilient data integrity and consistency.

\### Messaging Protocol and Miniblock Production

The message lifecycle in the Towns Protocol involves several distinct
stages, each designed to ensure decentralization, security, reliability,
and efficiency. The following describes the detailed technical steps:

\#### 1. Message Creation (Client-Side)

\*\*Client Initialization:\*\* Users interact with Towns Protocol via
secure client applications. Each client generates and securely stores a
pair of Curve25519 cryptographic keys for secure identification and
end-to-end encryption of messages.

\*\*Cryptographic Encryption:\*\*

\* Peer-to-peer messages used for sharing sessions are encrypted using
asymmetric key pairs cryptographically associated with the user\'s
wallet. \* Group and channel messages are encrypted using shared session
AEG-GSM encryption.

\*\*Signing:\*\* After encryption messages are signed with the user\'s
wallet.

\#### 2. Message Submission

\*\*Message Format:\*\* Messages conform to a standardized Protocol
Buffers payload format containing encrypted content, metadata, sender
signatures, hash of the recent miniblock in the stream message sent to,
and other required fields.

\*\*Client-to-Node Submission:\*\* Clients transmit messages via
gRPC-based API calls to Towns Protocol nodes, ensuring efficient,
reliable, and structured data exchange.

\#### 3. Node Processing and Validation

Upon receiving a message, nodes perform critical validation tasks:

\*\*Membership Verification:\*\* Nodes query the corresponding Space
smart contract on the Towns Chain to verify if the sender possesses the
requisite Membership NFT, validating their right to post messages within
that space.

\*\*Cryptographic Verification:\*\* Nodes verify digital signatures
using the sender\'s Curve25519 public key to ensure authenticity and
message integrity.

\*\*Timestamp and Replay Protection:\*\* Nodes enforce timestamp
synchronization thresholds and validate uniqueness of message signatures
to prevent replay attacks.

\#### 4. Decentralized Miniblock Production

Towns Protocol employs decentralized miniblocks to batch and immutably
store validated messages. The process involves:

\*\*Message Aggregation:\*\* Validated messages are grouped by nodes
into miniblocks, each representing short timeframes (2 seconds),
ensuring near-real-time messaging.

\*\*Consensus and Agreement (OP-Stack):\*\* Nodes use OP-Stack Towns
Protocol L2 blockchain to store stream hashes and maintain consensus and
agree on what is \"canonical\" version for any given stream.

\*\*Miniblock Structure:\*\* Each miniblock comprises:

\* \*\*Header\*\*: Contains metadata such as miniblock height, previous
miniblock hash, timestamp, Hashes of included events, hash of snapshot.
The header is signed by producing a node, hash of the header is used as
a hash identifying the miniblock. \* \*\*Body\*\*: Contains a sequence
of included unmodified client message that match hashes listed in the
header

\#### 5. Miniblock Submission to Towns Chain (L2)

After miniblock creation and consensus, nodes submit miniblock hash to
the Towns Chain (Layer 2) StreamRegistry Smart Contract, inheriting
Ethereum\'s strong security guarantees and ensuring that only one
miniblock is \"canonical\" for any given stream height.

\*\*Optimistic Rollup Integration:\*\* Miniblocks are periodically
batched and submitted to Ethereum\'s Layer 1 via optimistic rollups,
inheriting robust Ethereum consensus and security.

Miniblock production involves randomized node election, consensus
through voting, leader-driven event ordering, and mini-block formation
and signing.

\## Cryptographic Methodologies

Ensuring secure and verifiable communication within the Towns protocol
necessitates robust cryptographic methodologies. Towns implements
advanced encryption techniques alongside innovative cryptographic
proofs, enabling secure messaging, verifiable membership, and assured
data integrity across its decentralized infrastructure.

\### Secure Messaging and Membership Verification

All interactions within the Towns protocol leverage end-to-end
encryption to protect user communications, enforcing a strict
confidentiality model. Nodes within the network handle only ciphertext,
while plaintext encryption keys remain securely managed by client-side
devices.

A public asymmetric device encryption key is signed by the user\'s
wallet. This establishes a cryptographic link between device encrypting
or decrypting the message and identity of the user.

\### Innovations in Cryptographic Proofs for Data Integrity

To maintain the integrity of data streams within its Layer 2
architecture, the Towns Protocol employs a cryptographically secure
checkpointing system through miniblock headers. Each mini-block header
includes:

\* \*\*Hash of Previous Miniblock\*\*: Establishes a continuous chain of
custody for events, allowing verifiable historical integrity. \*
\*\*Hashes of Events\*\*: Compact representations ensuring efficient
verification and synchronization among nodes. \* \*\*Vote Proofs\*\*:
Consensus-derived cryptographic evidence from node participants,
validating block authenticity and consensus. \* \*\*Node Signatures\*\*:
Digital signatures from elected leader nodes, enhancing security and
providing non-repudiable proof of block authenticity.

These mini-block headers are locally stored by participating nodes and
broadcasted to clients, empowering independent verification of data
integrity and transaction finality. A client or node observing a
matching transaction hash with the mini-block header hash can
cryptographically affirm transaction immutability and finality.

\## Economic Model

The Towns Protocol establishes an economic framework designed to foster
sustainable growth and robust community engagement through clearly
defined incentive structures and diversified monetization pathways. By
aligning economic incentives with protocol participation, Towns ensures
the longevity and vibrancy of its decentralized social ecosystem.

\### Incentive Structures

A pivotal aspect of the Towns economic model is its sophisticated
incentive structure, aimed at rewarding all key ecosystem participants,
ensuring active engagement, and promoting the consistent growth of
Spaces.

\#### Transaction Fee Distribution

Transaction fees generated through user interactions within a Space are
methodically distributed among several critical stakeholders:

\* \*\*Space Owners\*\*: A substantial portion of the fees directly
compensates Space Owners, incentivizing them to actively manage and
cultivate their communities. \* \*\*Towns DAO\*\*: Fees allocated to the
Towns DAO support ongoing ecosystem-wide developments, infrastructure
upgrades, and governance enhancements through the \[Towns
Lodge\](https://townslodge.com). \* \*\*Referrers\*\*: Recognizing the
importance of community expansion, referrers---both for Space members
and protocol clients---receive fee shares as a direct incentive for
driving growth and adoption.

\#### Stake and Reward System

Node Operators and delegators within the Towns Protocol receive periodic
rewards based on a transparent, DAO-managed inflationary token model.
Rewards are systematically distributed bi-weekly, with Node Operators
receiving commissions defined at the time of registration, and
delegators sharing the remainder proportionally based on their stake.

\### Sustainability and Monetization

Towns Protocol ensures long-term sustainability by embedding multiple
monetization strategies directly within its architecture, empowering
community spaces to tailor financial models precisely to their needs and
visions.

\## Governance

The governance of the Towns Protocol is fully on-chain, leveraging
decentralized autonomous organization (DAO) principles to ensure
transparent, secure, and community-driven decision-making.

\### Governance Structure

Towns governance is facilitated through the \[Towns
Lodge\](https://townslodge.com), which operates via a series of smart
contracts deployed on Base. These contracts handle proposal submissions,
community voting, and decision implementation, ensuring that all
governance activities are transparent and immutable.

\#### Key Components

\*\*Token-Based Governance\*\* The Towns Token (TOWNS) serves as the
core governance token. Voting power is proportional to a participant\'s
token holdings, incentivizing active community participation and
aligning stakeholders\' interests with the protocol\'s long-term
success.

\#### Proposal Lifecycle

\*\*Submission\*\* Eligible stakeholders (Space Owners and Node
Operators meeting specific activity thresholds) can submit proposals.
Proposals must clearly articulate their purpose, demonstrate
feasibility, and align with the long-term vision of Towns.

\*\*Discussion\*\* Submitted proposals undergo an open discussion phase,
allowing stakeholders to deliberate potential impacts, suggest
improvements, and refine proposals for clarity and effectiveness.

\*\*Voting\*\* After the discussion phase, proposals proceed to a voting
stage where token holders cast their votes. The outcome is determined by
a majority weighted by token holdings.

\*\*Implementation\*\* Approved proposals automatically trigger smart
contracts for efficient, transparent implementation of changes or
upgrades within the protocol.

\#### Special Provisions

\* \*\*Subgroup Delegation\*\*: The DAO may delegate specific decisions
to subgroups with defined permissions and budget allocations from the
primary treasury. \* \*\*On-chain Upgrades\*\*: The DAO retains
authority to implement upgrades on any on-chain component, including
adjustments to Node Registry requirements, membership fees, and
functionalities of core contracts like the Space Factory.

\### Transparency and Auditability

All governance proposals, discussions, voting outcomes, and
implementation details are permanently recorded on-chain. This ensures
complete transparency and allows continuous auditability, reinforcing
trust among stakeholders and preserving the integrity of the governance
process.

In summary, the Towns Protocol employs a robust, token-based governance
model that emphasizes decentralization, transparency, and community
participation, ensuring its continuous evolution and adaptability.

\# Towns Technical Overview Source:
https://docs.towns.com/white-paper/towns-technical-overview

Comprehensive technical overview covering Towns Protocol\'s legal
classification, token economics, technical architecture, governance
structure, and regulatory compliance for decentralized communication
infrastructure.

\## Introduction & Project Description

\### What is Towns Protocol?

\*\*Towns Protocol\*\* (\[towns.com\](https://towns.com)) is the
blockchain foundation for decentralized, real-time messaging. It
provides a protocol, infrastructure, and economic system for anyone to
create and own programmable communication spaces---moving group chat,
community coordination, and digital membership fully on-chain.

Towns combines:

\* An \*\*EVM-compatible Layer 2 blockchain\*\* (Towns Protocol Chain,
built on Celestia) \* A network of \*\*decentralized stream nodes\*\*
for real-time, encrypted message routing and consensus \* \*\*Smart
contracts deployed on Base Mainnet\*\* (Ethereum L2) for memberships,
governance, and protocol rewards

\### What Makes Towns Unique?

\* \*\*Programmable, Ownable Spaces\*\*: Any user can create a Space---a
programmable, on-chain group with customizable access, reputation, and
economics. \* \*\*Native Web3 Messaging\*\*: Real-time, end-to-end
encrypted chat; no central servers; privacy and security by design. \*
\*\*On-Chain Memberships & Subscriptions\*\*: Memberships are ERC-721
NFTs; access and participation can be bought, earned, or transferred
on-chain. \* \*\*Integrated Incentives\*\*: Both community owners and
participants earn protocol rewards for growth and engagement. \*
\*\*Full User Sovereignty\*\*: Users own their memberships and data, can
move freely between communities, and cannot be censored or banned by any
central authority.

\### Why Towns? (The Problem Solved)

Traditional chat and community platforms monetize user data, restrict
ownership, and rely on central control, with no real incentives for user
or creator participation. Towns Protocol removes centralized
bottlenecks, giving communities direct economic upside, true control
over membership, and programmable logic for communication.

\### Token Information

\* \*\*Token Name/Ticker\*\*: Towns (\\\$TOWNS) \* \*\*Genesis
Supply\*\*: 10,128,333,333 tokens \* \*\*Maximum Supply (after 7
years)\*\*: 15,327,986,354 tokens (protocol inflation) \* \*\*Launch
Date\*\*: TBA \* \*\*Token Chain\*\*: Ethereum Mainnet (Base L2)

\*\*\\\$TOWNS Token Utility:\*\*

1\. \*\*Network Security\*\*: Validators stake \\\$TOWNS to secure the
protocol. 2. \*\*Governance\*\*: Token holders vote on upgrades,
economic parameters, and protocol changes. 3. \*\*Protocol Utility\*\*:
Token delegation enables enhanced features and programmable access in
Spaces.

\## Project Overview

\### Purpose and Description

\*\*Towns Protocol\*\* is a decentralized, blockchain-based protocol
enabling real-time messaging and programmable, user-owned communities
called \"Spaces.\" Key protocol characteristics:

\* Native Web3 messaging \* Embedded economic incentives \* Programmable
infrastructure supporting user-deployed, ownable, and value-accruing
communication channels

\*\*Architecture:\*\*

\* \*\*EVM-compatible Layer 2 chain (Towns Chain)\*\*: Celestia-based,
app-specific Ethereum L2 \* \*\*Decentralized stream nodes\*\*: For
off-chain data processing, message validation, and consensus \*
\*\*Smart contracts on Base (Ethereum L2)\*\*: Governing Spaces,
memberships, node rewards, and protocol upgrades

\*\*\"Spaces\"\*\* are on-chain, programmable channels, supporting:

\* On-chain membership (ERC-721 NFTs) \* Programmable reputation and
access logic \* End-to-end encrypted messaging

\### Use of Funds

Funds raised through \\\$TOWNS are used exclusively for:

\* Protocol development and ongoing R\\&D \* Operational costs of the
River Eridanus Association \* Ecosystem expansion and community support

\## Legal and Regulatory Classification

\### Token Classification

\*\*\\\$TOWNS is a utility token\*\* as per Swiss (FINMA) and Korean
legal opinions.

It \*\*does NOT qualify\*\* as:

\* E-money token \* Asset-referenced token \* Payment token \* Security
or financial instrument (explicitly confirmed by FINMA and Korean
analysis) \* Hybrid token

The \\\$TOWNS token aligns with MiCA\'s definition of \"other
crypto-asset token.\"

\*\*Main functionalities are operational at issuance\*\* (staking,
delegated staking, governance).

\## Token Rights and Utility

\### Holder Rights

Holders of \\\$TOWNS tokens can:

\* \*\*Stake tokens\*\* to secure the network and support node
operations (Proof-of-Stake consensus) \* \*\*Delegate staking\*\* to
node operators and participate in securing the network \*
\*\*Participate in governance\*\*: Vote on protocol upgrades, economic
parameters, and improvements \* \*\*Unlock protocol features\*\*:
Delegation and participation unlock enhanced features within Spaces

\<Warning\> \\\$TOWNS \*\*does NOT grant any rights to financial
returns, profit, or capital reimbursement\*\*. It \*\*does NOT represent
equity, debt, or ownership\*\* in the protocol, association, or DAO.
\</Warning\>

\## Technical Overview

\### Architecture

\* \*\*Canonical Chain\*\*: Towns Protocol Chain (Celestia-based,
app-specific Ethereum L2) \* \*\*Smart Contract Layer\*\*: Deployed on
Base Mainnet (Ethereum L2) \* \*\*Node Infrastructure\*\*:
Permissionless, decentralized node operators validate, sequence, store,
and propagate encrypted messages. \* \*\*Membership Management\*\*:
ERC-721 NFTs representing on-chain membership, programmable access, and
entitlement logic

\### Security and Cryptography

\* \*\*End-to-end encrypted messaging\*\*: Curve25519 keys, shared
session AES-GSM algorithm. \* \*\*Node and membership verification\*\*:
Each user/client has a device ID (Curve25519 key pair), with public keys
on-chain and private keys stored client-side \* \*\*Consensus\*\*:
Decentralized, deterministic mini-block production and synchronization
using OP-Stack for rollup integration and on-chain finality

\## Token Economics and Incentive Structure

\### Token Functions

\* \*\*Protocol security\*\*: Validators/nodes require \\\$TOWNS staking
to participate and earn rewards \* \*\*Delegation\*\*: Non-operators may
delegate tokens to nodes and share in rewards \* \*\*Governance\*\*:
Token-based DAO, with voting power proportional to token holdings

\### Rewards and Sustainability

\* \*\*Node rewards\*\*: Periodic (bi-weekly) inflation, distributed by
DAO-managed smart contracts \* \*\*Buy-and-burn\*\*: Protocol uses
collected ETH fees to periodically buy back and burn \\\$TOWNS,
balancing inflation \* \*\*Commission model\*\*: Node operators can set
commission rates deducted from rewards

\## Governance

Token governance goes live, January 1, 2026.

\### Proposal Lifecycle

1\. \*\*Submission\*\*: All \\\$TOWNS tokenholders 2.
\*\*Discussion\*\*: Open deliberation 3. \*\*Voting\*\*: Token-weighted
voting 4. \*\*Implementation\*\*: Approved proposals executed onchain

\### Transparency

All proposals, votes, and outcomes are available on-chain and auditable.

\## Environmental Impact

\* \*\*Proof-of-Stake (PoS) consensus\*\*: Substantially lower energy
use compared to Proof-of-Work \* \*\*Layer 2 efficiency\*\*:
Transactions are processed off-chain, with batching and rollup to
Ethereum L1 for finality---drastically reducing per-transaction energy
and cost \* The protocol\'s decentralized infrastructure is designed to
be energy-efficient and scalable

\## Risks

\<Warning\> \*\*Potential risks include:\*\*

\* \*\*Technological risk\*\*: Smart contract/infrastructure bugs,
protocol exploits \* \*\*Regulatory risk\*\*: Evolving legal
classification or restrictions in relevant jurisdictions \* \*\*Market
risk\*\*: Token price volatility, speculative trading \* \*\*Operational
risk\*\*: Dependency on protocol/community adoption, node uptime \*
\*\*External risk\*\*: Infrastructure, internet or blockchain ecosystem
issues

\*\*Note\*\*: Prospective holders are advised to perform independent due
diligence and consult with legal/financial professionals. \</Warning\>

\## Disclaimer

\<Warning\> \* This document \*\*does not constitute an offer of
securities, e-money, or other regulated financial instruments.\*\* \*
The \\\$TOWNS token will \*\*not be for sale in any jurisdiction where
such activity is unlawful or would require registration or
licensing\*\*. \* This document \*\*is not legal, investment, or tax
advice.\*\* \</Warning\>

\## Additional Information

Protocol documentation and further details:
\[towns.com\](https://towns.com)

\## Token Distribution, Allocation, and Vesting

\### Genesis Allocation

\| \*\*Category\*\* \| \*\*Amount (Tokens)\*\* \| \*\*% of Genesis
Supply\*\* \| \*\*Notes\*\* \| \|
:\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--: \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--: \|
:\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--
\| \| \*\*Investor\*\* \| 1,391,716,724 \| 13.74% \| Seed, Series A/B;
vesting applies; locked by 3rd party \| \| \*\*Public Investor\*\* \|
265,557,200 \| 2.62% \| Foundation/Echo round; vesting applies \| \|
\*\*Initial Airdrop\*\* \| 1,517,747,434 \| 14.98% \| Early users,
network participants, year 1 campaigns, partners, and launch
collaborators. \| \| \*\*Community Reserve\*\* \| 3,426,789,407 \|
33.83% \| Future rewards/incentives; vesting, held by foundation \| \|
\*\*Team\*\* \| 2,173,033,276 \| 21.46% \| Team incentives; vesting;
locked by 3rd party \| \| \*\*Liquidity\*\* \| 425,000,000 \| 4.2% \| \|
\| \*\*Nodes Year 1\*\* \| 800,000,000 \| 7.90% \| For node operators in
year 1; protocol-driven release \| \| \*\*Node Inflation\*\* \|
128,333,333 \| 1.27% \| Ongoing protocol inflation \| \| \*\*Total\*\*
\| \*\*10,128,333,333\*\* \| \*\*100.00%\*\* \| \*\*Genesis supply\*\*
\|

\* \*\*Genesis Supply\*\*: 10,128,333,333 \\\$TOWNS

\* \*\*Max Supply at T+84 months\*\*: 15,327,986,354 \\\$TOWNS (protocol
inflation and allocations)

\### Vesting and Release Structure

\* \*\*Investor, Public Investor, Team, and Community Reserve
allocations\*\* are subject to vesting/locking schedules. \*
\*\*Airdrop\*\* is distributed to early network participants at launch.
\* \*\*Nodes Year 1\*\*: Released as earned by network node operators.
\* \*\*Node Inflation\*\*: Ongoing protocol reward issuance.

\### Circulating Supply Schedule

Below is the 6-month-by-6-month projection of circulating supply after
the Token Generation Event (TGE):

\| \*\*Time Since TGE\*\* \| \*\*Circulating Supply (\\\$TOWNS)\*\* \|
\*\*% of Genesis Supply\*\* \| \| :\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-- \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--: \|
\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\-\--: \| \| TGE \| 2,109,362,819
\| 20.69% \| \| + 6 months \| 2,884,055,126 \| 27.22% \| \| +12 months
\| 3,672,266,501 \| 33.40% \| \| +18 months \| 5,647,796,943 \| 49.57%
\| \| +24 months \| 7,595,839,981 \| 64.42% \| \| +30 months \|
9,442,926,935 \| 77.55% \| \| +36 months \| 11,287,526,484 \| 89.88% \|
\| +42 months \| 12,228,501,516 \| 94.59% \| \| +48 months \|
13,166,989,143 \| 99.03% \| \| +54 months \| 13,521,908,184 \| 99.06% \|
\| +60 months \| 13,874,339,822 \| 99.08% \| \| Max Supply \|
15,327,986,354 \| 100.00% \|

\### Additional Notes

This table does not account for potential early burns, slashing
penalties, or buyback events, which may further reduce circulating
supply over time.

\## Technical System Design

\### Abstract

Digital communication is foundational to modern life but remains mostly
centralized, limiting user sovereignty, privacy, and economic
participation. \*\*Towns Protocol\*\* leverages blockchain to enable
decentralized, cryptographically secure, and programmable real-time
messaging through a network of user-owned Spaces. Each Space is managed
by on-chain smart contracts, allowing for modular membership,
programmable access, and integration with Web3 economic primitives.

\### System Design

\#### Protocol Architecture

\* \*\*Towns Chain\*\*: Celestia-based, app-specific Ethereum Layer 2.
\* \*\*Smart Contracts\*\*: Deployed on Base Mainnet (Ethereum L2),
governing Spaces, memberships (ERC-721 NFTs), node incentives, and
governance operations. \* \*\*Stream Nodes\*\*: Decentralized off-chain
nodes handle message validation, encrypted data propagation, storage,
consensus, and synchronization.

\#### Spaces and Memberships

\* \*\*Spaces\*\*: On-chain, programmable channels with unique contract
addresses, supporting custom governance, access, and reputation systems.
\* \*\*Memberships\*\*: ERC-721 NFTs as proof of membership, with
on-chain or cross-chain gating and programmable entitlement logic.

\#### Node Layer and Consensus

\* \*\*Node Registry\*\*: Tracks active nodes and manages their staking
and performance metrics. \* \*\*Consensus\*\*: Mini-block production by
stream nodes, finalized on Towns Chain, with periodic rollup to Ethereum
L1 for security and finality (via OP-Stack). \* \*\*Event
Validation\*\*: Encrypted messages are validated for membership,
signatures, permissions, and anti-replay measures.

\#### Cryptography

\* \*\*End-to-end Encryption\*\*: Curve25519 keys per device; asymmetric
encryption for peer-to-peer messages; shared session AES-GSM for
channels and group messages. \* \*\*Membership Verification\*\*:
On-chain registered public keys, device-bound identity, and
cryptographic proofs for access.

\#### Economic Model

\* \*\*Rewards\*\*: Node operators and delegators earn inflationary
\\\$TOWNS rewards; protocol incentives are distributed bi-weekly. \*
\*\*Fees\*\*: Protocol collects transaction fees. \*
\*\*Buy-and-Burn\*\*: ETH fees will be used for buyback and burning,
balancing inflation. \* \*\*Governance\*\*: \[Towns
Lodge\](https://townslodge.com) houses proposals and controls the
Treasury through governance.

\#### Security and Privacy

\* \*\*End-to-end encryption\*\* ensures node operators and protocol
cannot access plaintext communications. \* \*\*All governance, economic,
and protocol changes are fully auditable on-chain.\*\*

\#### Environmental Efficiency

\* \*\*Proof-of-Stake\*\* consensus and Layer 2 architecture
dramatically reduce energy usage compared to traditional blockchains. \*
\*\*Batching and rollups\*\* minimize per-transaction resource demands.

\### Protocol Innovations

\* \*\*Decentralized, ownable communication Spaces with programmable
logic.\*\* \* \*\*On-chain reputation and membership via NFTs.\*\* \*
\*\*Encrypted, permissioned messaging at Web2 speeds, with Web3
security.\*\* \* \*\*Transparent, on-chain governance and auditable
protocol upgrades.\*\* \* \*\*Direct integration with DeFi and Web3
payment primitives.\*\*

\## Closing & Further Information

\*\*Towns Protocol\*\* aims to provide the secure, programmable, and
decentralized communication infrastructure that the internet has always
needed. By moving messaging, memberships, and group economics fully
on-chain, Towns empowers communities and individuals with true
ownership, privacy, and opportunity for innovation.

\*\*Compliance Notice\*\*: The \\\$TOWNS token is classified as a
utility token. It does not constitute a security, payment instrument, or
e-money token.

The information in this document is intended for informational purposes
only and does not constitute legal, tax, or investment advice.
Distribution or sale of \\\$TOWNS may be restricted in certain
jurisdictions.
