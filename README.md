# Manas Portfolio 2026

Personal portfolio website with a Spring Boot API that sends contact form
messages straight to your email — no database, no admin login, just a
clean email delivery pipeline.

link - https://manas-suryavanshi.netlify.app

## Project Structure

```
├── frontend/            # Static site: HTML, CSS, JS
│   ├── index.html, about.html, projects.html, achievements.html, contact.html
│   ├── config.js        # Points the frontend at your backend URL
│   ├── script.js, style.css
└── backend/              # Java Spring Boot contact API
    ├── src/main/java/com/manas/portfolio/
    ├── src/main/resources/application.properties
    ├── Dockerfile
    └── .env.example
```

## How it works

1. Visitor fills out the form on `contact.html`.
2. The frontend `POST`s the form data as JSON to `/api/contact` on your backend.
3. The backend validates the input and sends you an email **via Resend's HTTP API**
   (with Reply-To set to the visitor's address, so you can just hit reply),
   then sends the visitor a short confirmation email.
4. A basic honeypot field and per-IP rate limit (5 submissions / 15 min)
   keep out casual spam and bots.

There is no database and no admin panel — every message goes straight to
your inbox.

**Why an email API instead of Gmail SMTP?** Most free-tier hosts (Render
included) block outbound SMTP ports (25/465/587) to stop the platform being
used for spam — so a direct Gmail SMTP connection just times out. Resend
sends over a normal HTTPS API call instead, which is never blocked.

---

## 1. Set up Resend (free, ~2 minutes)

1. Sign up at [resend.com](https://resend.com) using **the same email you want
   contact form messages delivered to** (e.g. `manas240surya@gmail.com`) —
   this matters because of a sandbox restriction explained below.
2. Go to **API Keys** → **Create API Key** → copy the key (starts with `re_`)
3. That's it for now. You can send emails immediately using Resend's shared
   sandbox sender (`onboarding@resend.dev`) — no domain setup required to get started.

**Sandbox limitation:** until you verify your own domain on Resend, you can
only send emails **to the address you signed up with**. That means:
- The notification email *to you* works immediately.
- The confirmation email *to the visitor* will silently fail until you verify
  a domain (this won't break anything — it's a best-effort email and failures
  there don't affect the main flow).

To lift that restriction later: **Domains** tab in Resend → add your own
domain → add the DNS records they give you → once verified, update
`RESEND_FROM_EMAIL` to use that domain and both emails will work for anyone.

## 2. Run the backend locally

**Requirements:** Java 17+, Maven

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Resend API key:

```
RESEND_API_KEY=re_your_actual_key
RESEND_FROM_EMAIL=Portfolio Contact <onboarding@resend.dev>
CONTACT_TO_EMAIL=manas240surya@gmail.com
ALLOWED_ORIGINS=http://localhost:5500
```

Then, on macOS/Linux:

```bash
export $(cat .env | xargs)
mvn spring-boot:run
```

On Windows PowerShell:

```powershell
$env:RESEND_API_KEY="re_your_actual_key"
$env:RESEND_FROM_EMAIL="Portfolio Contact <onboarding@resend.dev>"
$env:CONTACT_TO_EMAIL="manas240surya@gmail.com"
$env:ALLOWED_ORIGINS="http://localhost:5500"
mvn spring-boot:run
```

The API runs at `http://localhost:8080`. Check `http://localhost:8080/api/health` returns `{"status":"UP"}`.

## 2. Run the frontend locally

```bash
cd frontend
python -m http.server 5500
```

Open `http://localhost:5500/contact.html`. `config.js` should point at
`http://localhost:8080` for local testing (see the commented line in that file).

---

## 3. Deploy to production

### Backend (Render — free tier works well)

1. Push the `backend/` folder to its own GitHub repo (or a subfolder of your repo).
2. On [Render](https://render.com), create a **New Web Service**, connect the repo,
   and choose **Docker** as the environment (it will pick up the included `Dockerfile`).
3. Add environment variables in Render's dashboard:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (can leave as the sandbox default for now)
   - `CONTACT_TO_EMAIL`
   - `ALLOWED_ORIGINS` — set this to your deployed frontend URL(s), e.g.
     `https://yourusername.github.io,https://your-site.netlify.app`
4. Deploy. Render gives you a URL like `https://your-backend.onrender.com`.
   Note: on the free tier the service sleeps after inactivity, so the first
   request after idle time can take ~30-60s to wake up.

Railway works the same way — connect the repo, it detects the Dockerfile, and
you set the same environment variables.

### Frontend (any static host)

Update `frontend/config.js` first:

```javascript
window.PORTFOLIO_API_URL = "https://your-backend.onrender.com";
```

Then deploy the `frontend/` folder to whichever host you prefer:

- **GitHub Pages** — push `frontend/` contents to a repo, enable Pages in
  Settings → Pages, pick the branch/folder.
- **Netlify** — drag-and-drop the `frontend/` folder onto
  [app.netlify.com/drop](https://app.netlify.com/drop), or connect the repo
  for auto-deploys on push.
- **Vercel** — `vercel deploy` from inside `frontend/`, or connect the repo
  and set the root directory to `frontend`.

After deploying, double check:
- The deployed frontend's exact origin (including `https://`) matches an
  entry in the backend's `ALLOWED_ORIGINS`.
- Submitting the contact form on the live site actually lands an email in
  your inbox (check spam folder the first time).

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/contact` | Submit contact form — emails you directly |

### POST /api/contact — request body

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "subject": "Let's collaborate",
  "message": "Hi Manas, ..."
}
```

### Response

```json
{ "success": true, "message": "Thank you! Your message has been sent." }
```

On validation errors or delivery failure, `success` is `false` and
`message` explains why (HTTP 400 for bad input, 429 if rate-limited, 500
if the email couldn't be sent).
