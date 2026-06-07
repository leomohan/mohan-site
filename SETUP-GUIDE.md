# leomohan.net — Website Setup & Maintenance Guide

## Repository Structure

```
mohan-site/
├── index.html              ← Homepage
├── about.html              ← About Me
├── certifications.html
├── inspiration.html
├── travel.html
├── youtube.html
├── podcasts.html
├── articles.html           ← All LinkedIn articles
├── leoaitoons.html         ← leoAIToons cartoon series
├── technology.html         ← Genre page
├── business.html
├── fiction.html
├── general.html
├── humor.html
├── philosophy.html
├── spiritual.html
├── syngress.html
├── storybooks.html
├── tamil.html
├── assets/images/          ← All book covers and photos
└── data/
    ├── technology.json     ← Book data (one file per genre)
    └── ...
```

## How to Add a New Book

1. Copy cover image to `assets/images/your-cover.jpg`
2. Open `data/technology.json` (or relevant genre file)
3. Add entry at the TOP of the array:
```json
{
  "title": "Your Book Title",
  "image": "assets/images/your-cover.jpg",
  "buyUrl": "https://amazon.com/dp/XXXXXXXX",
  "description": "One line description."
}
```
4. Commit and push — site auto-deploys in ~60 seconds.

## Formspree Contact Form

In `index.html`, find:
```html
<form action="https://formspree.io/f/YOUR_FORM_ID">
```
Replace `YOUR_FORM_ID` with your actual Formspree form ID.

## GitHub → Cloudflare Auto-Deploy Setup

1. Get Cloudflare API Token: dash.cloudflare.com → My Profile → API Tokens
2. Get Account ID: shown in right sidebar of Cloudflare dashboard
3. Add to GitHub Secrets (repo Settings → Secrets → Actions):
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Every push to `main` branch auto-deploys within ~60 seconds.

## Design Tokens

| Token | Value | Use |
|---|---|---|
| `--cream` | `#FAF7F2` | Page background |
| `--ink` | `#1A1714` | Headings |
| `--gold` | `#A0813A` | Accents, CTAs |
| `--ff-display` | Cormorant Garamond | Headings |
| `--ff-body` | DM Sans | Body text |
