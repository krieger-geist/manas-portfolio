# Manas Portfolio 2026

Personal portfolio website with a Spring Boot API that sends contact form
messages straight to your email — no database, no admin login, just a
clean email delivery pipeline.

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
3. The backend validates the input, emails **you** immediately (with
   Reply-To set to the visitor's address, so you can just hit reply),
   and sends the visitor a short confirmation email.
4. A basic honeypot field and per-IP rate limit (5 submissions / 15 min)
   keep out casual spam and bots.

There is no database and no admin panel — every message goes straight to
your inbox.

---

## 1. Run the backend locally

**Requirements:** Java 17+, Maven

```bash
cd backend
cp .env.example .env
```

Edit `.env` (or export the variables directly) with your Gmail credentials:

```
MAIL_USERNAME=your-gmail-address@gmail.com
MAIL_PASSWORD=your-16-character-app-password
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
Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
        Set-Item -Path "Env:$($matches[1])" -Value $matches[2]
    }
}
mvn spring-boot:run
```

The API runs at `http://localhost:8080`. Check `http://localhost:8080/api/health` returns `{"status":"UP"}`.

### Gmail App Password setup

1. Turn on 2-Step Verification on the Google account you're sending from.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Use that 16-character password as `MAIL_PASSWORD` — not your normal Gmail password.

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
   - `MAIL_USERNAME`
   - `MAIL_PASSWORD`
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
