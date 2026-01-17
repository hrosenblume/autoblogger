# ✨ Autoblogger

**The AI-native CMS that makes writing feel like magic.**

[![npm version](https://img.shields.io/npm/v/autoblogger.svg)](https://www.npmjs.com/package/autoblogger)
[![license](https://img.shields.io/npm/l/autoblogger.svg)](https://github.com/hrosenblume/autoblogger/blob/main/LICENSE)

Content is king. Speed is everything.

In the age of AI and SEO, the blogs that win are the ones that publish consistently. Autoblogger drops a complete AI-powered writing studio into your Next.js app—so you can go from idea to published post in minutes, not hours.

---

## Why Autoblogger?

The game has changed. AI-generated content is everywhere. SEO rewards fresh, frequent publishing. You need to write fast.

**Before:** Open CMS. Open ChatGPT. Copy. Paste. Format. Fix formatting. Publish. *2 hours later...*

**After:** Type your idea. AI writes. You tweak. Publish. *Done in 15 minutes.*

---

## Features

### 🤖 AI That Actually Helps

- **Generate from ideas** — Describe what you want, get a polished essay
- **Chat while you write** — Ask questions, get feedback, brainstorm
- **Agent mode** — Tell AI to edit your essay directly ("make the intro punchier")
- **Plan mode** — Generate outlines, then expand into full essays
- **Web search** — Ground AI responses with real-time information

### ✍️ Writing That Feels Good

- **Beautiful editor** — Tiptap-based WYSIWYG that syncs to markdown
- **Keyboard-first** — `⌘K` for chat, `⌘S` to save, `Esc` to navigate
- **Revision history** — Every save is a snapshot you can restore
- **Inline comments** — Highlight text, leave notes, collaborate

### 🔌 Plays Nice With Everything

- **Your database** — Uses your Prisma client, your schema
- **Your auth** — Plugs into NextAuth, Clerk, or custom auth
- **Your styles** — Standalone CSS included, Tailwind optional
- **External CMSs** — Sync to Prismic, Contentful, Sanity on publish

### 🤯 Automate Your Content Pipeline

- **RSS auto-draft** — Subscribe to feeds, auto-generate essays from news
- **Topic subscriptions** — Define keywords, get suggested posts daily
- **Webhooks** — Trigger workflows when posts are published

---

## Quickstart

```bash
npm install autoblogger
npx autoblogger init
```

Add your AI key to `.env`:

```env
ANTHROPIC_API_KEY="sk-ant-..."
```

Start your app and visit `/writer`. That's it.

📖 **[Full Setup Guide →](docs/GUIDE.md)**

---

## Requirements

- Next.js 14, 15, or 16 (App Router)
- Prisma 5 or 6
- Node.js 20+

---

## Documentation

- 📖 **[Full Setup Guide](docs/GUIDE.md)** — Complete installation and configuration
- 🔧 **[Configuration Options](docs/GUIDE.md#configuration-options)** — All available settings
- 🔐 **[Authentication](docs/GUIDE.md#authentication)** — NextAuth, Clerk, custom auth
- 🎨 **[Styling](docs/GUIDE.md#styling)** — Customize the dashboard
- 🔌 **[CMS Integration](docs/GUIDE.md#external-cms-integration)** — Prismic, Contentful, Sanity
- 📡 **[Auto-Draft](docs/GUIDE.md#auto-draft-from-rss)** — Generate posts from RSS feeds

---

## License

MIT © [Hunter Rosenblume](https://github.com/hrosenblume)

---

<p align="center">
  <strong>Write faster. Publish more. Win at SEO.</strong>
  <br><br>
  <code>npx autoblogger init</code>
</p>
