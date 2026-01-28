

## Bot Token URL Authentication

This plan adds support for your AI agent to access the app via a URL with the bot token included as a query parameter:

```
https://chad-kanban-buddy.lovable.app/?token=your_bot_token_here
```

---

## What This Enables

When your AI agent browses to the app with the token in the URL:

1. The app detects the `?token=xxx` parameter
2. Shows a **Bot Control Panel** with action buttons the agent can click
3. The token is used automatically to authenticate all bot actions
4. Your agent can create tasks, add comments, and complete tasks by clicking UI buttons

---

## Implementation Overview

### 1. Bot Token Context

Create a React context to store and provide the bot token throughout the app when detected in the URL.

### 2. Bot Control Panel Component

A floating panel that appears when a valid token is detected, featuring:
- Visual indicator showing "Bot Mode Active"
- Quick action buttons:
  - **Create Task** - Opens a simplified form
  - **Add Comment** - Select a task and add a comment
  - **Complete Task** - Mark a task as done
- Task selector dropdown for actions that need a target task

### 3. API Integration Hook

A hook that uses the token from context to call the existing `bot-actions` backend function, enabling:
- Direct task creation
- Comment posting
- Task completion

---

## How Your AI Agent Will Use It

1. Navigate to: `https://chad-kanban-buddy.lovable.app/?token=YOUR_BOT_TOKEN`
2. The bot panel appears with clickable buttons
3. Click "Create Task" → Fill form → Submit
4. Click on a task → Click "Add Comment" → Type → Submit
5. Click on a task → Click "Complete Task"

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/contexts/BotTokenContext.tsx` | Create - Token provider |
| `src/components/BotControlPanel.tsx` | Create - Floating UI panel |
| `src/hooks/useBotActions.ts` | Create - API calls with token |
| `src/App.tsx` | Modify - Wrap with BotTokenProvider |
| `src/pages/Index.tsx` | Modify - Include BotControlPanel |

---

## Technical Details

### Token Detection Logic
```text
URL: /?token=abc123
       |
       v
  BotTokenContext reads searchParams
       |
       v
  Token stored in React state
       |
       v
  BotControlPanel renders if token exists
       |
       v
  useBotActions hook uses token for API calls
```

### Security Considerations
- Token is read from URL and stored only in React state (memory)
- Token is not persisted to localStorage or sent to backend except for authorized actions
- The existing `x-bot-secret` header authentication remains unchanged

