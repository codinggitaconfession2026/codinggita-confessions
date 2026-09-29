# CodingGita Community v3

A student-first community app with Gmail-only signup, anonymous/public posts, likes, moderation, friend requests, friends-only chat, block/report, a private admin-support chat that works **before a post is approved**, AI Buddy, and an Instagram Content Studio.

## Quick start (easy setup)
```bash
npm install
npm run setup
npm run dev
```
Open http://localhost:3000.

`npm run setup` asks for your Supabase URL/keys and admin credentials, then creates `.env.local` with a random admin session secret. You can also edit `.env.local` manually.

## One required Supabase step
In Supabase Dashboard → SQL Editor, run the **complete** `supabase/schema.sql` file once. It creates profiles, posts, moderation, friends, private chat, blocks, reports and private student↔admin support messages.

## Admin ↔ student chat before approval
A pending post keeps its `author_id`. Admins can click **Chat with author** on any pending post and message that student privately before approving/rejecting the post. Students can use **Admin Chat** in the navbar to reply. These support messages are separate from friend chat and are visible only to the student and authorized admins.

## Student chat
Friend chat is friends-only by default. Users can block/report. Normal conversations are allowed; the app has a lightweight server-side abuse flag for review. For production, add a stronger moderation provider/ruleset and customize policies for your institute.

## AI
Set `AI_API_KEY` only when you are ready to enable CG Buddy. Keep the key server-side. Without a key, the UI reports that AI is not configured.

## Instagram
The Content Studio generates downloadable Post, Story and Reel assets. Direct publishing is intentionally gated behind official Meta API credentials/eligibility. Never automate Instagram passwords or unofficial login bots. Verify current Meta permissions/media requirements before enabling publishing.

## Production notes
The legal pages are templates, not legal advice. Customize privacy/terms/community guidelines and define a real moderation/appeal process before public launch. Do not promise absolute anonymity.

## Premium UI refresh
The current build includes a redesigned responsive UI layer: branded navigation, polished home page, community feed/composer, account/admin authentication cards, moderation dashboard styling, responsive mobile navigation, and consistent buttons/cards/forms. Existing Supabase/API functionality is preserved.
