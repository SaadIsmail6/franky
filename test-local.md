# Testing Franky Bot Locally

## 1. Start the bot
```bash
bun run start
```

You should see: `Listening on :3000`

## 2. Test the health endpoints

### Test GET / (basic health check)
```bash
curl http://localhost:3000/
```
Expected: `Franky is running ✅`

### Test GET /health (JSON health check)
```bash
curl http://localhost:3000/health
```
Expected: `{"ok":true}`

## 3. Test the webhook (requires Towns credentials)

The POST `/webhook` endpoint will only work with valid Towns credentials and JWT tokens from the Towns server.

## 4. Stop the bot

Press `Ctrl+C` in the terminal where the bot is running.

## Troubleshooting

- **Port already in use**: Change `PORT` in `.env` to a different port (e.g., `3001`)
- **Missing credentials**: Make sure `.env` has valid `APP_PRIVATE_DATA` and `JWT_SECRET`
- **Bun not found**: Install Bun from https://bun.sh


