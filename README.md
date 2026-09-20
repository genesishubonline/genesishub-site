# GenesisHub株式会社 — website

Static site for https://www.genesishub.online, migrated from Wix to GitHub Pages.

```
index.html            ホーム（日本語）— 対象: 日本企業。信頼性・法人としての実在を伝える
en/index.html         Home (English) — audience: overseas companies; sells Japan market-entry expertise
info.html             会社情報       (also served at /info)
privacypolicy.html    プライバシーポリシー (also served at /privacypolicy)
style.css             all styles (design tokens at the top of the file)
site.js               mobile menu + Formspree contact form (shared by all pages)
images/               site images (game artwork only)
CNAME                 custom domain for GitHub Pages (www.genesishub.online)
.nojekyll             tells GitHub Pages to serve files as-is
```

Editing: open the `.html` file, change the text, commit, push. GitHub Pages redeploys in about a minute.

The two homepages are written for different audiences, not translated 1:1. Japanese: show Japanese corporations that GenesisHub is a legitimate company established in Japan (company facts up front). English: attract overseas clients with market analysis, go-to-market strategy, marketing/advertising, localization and business matching. Keep that split when editing copy. Colors, fonts and spacing live in the `:root` block at the top of `style.css`.

---

## 1. First-time publish (Terminal)

```bash
which gh || brew install gh
gh auth status || gh auth login          # GitHub.com → HTTPS → login with browser

cd ~/Desktop/genesishub-site
git init
git branch -M main
git add .
git commit -m "Migrate GenesisHub site from Wix to static HTML"

gh repo create genesishub-site --public --source=. --remote=origin --push

# enable GitHub Pages from main branch, root folder
gh api --method POST -H "Accept: application/vnd.github+json" \
  "/repos/{owner}/genesishub-site/pages" \
  -f "source[branch]=main" -f "source[path]=/"

# check (repeat until status is "built")
gh api "/repos/{owner}/genesishub-site/pages" --jq '.status, .html_url, .cname'
```

Or, with Claude Code (`cd ~/Desktop/genesishub-site && claude`):

> Initialize this folder as a git repo on branch main, commit everything, create a public GitHub repo named genesishub-site with gh and push, then enable GitHub Pages from main branch root via the gh api and show me the Pages status and URL.

## 2. Point the domain at GitHub (DNS)

Log in wherever `genesishub.online` is registered (if the domain was bought through Wix: Wix dashboard → Domains → genesishub.online → Manage DNS records). Replace `USERNAME` with your GitHub username.

| Type  | Host / Name | Value                     |
|-------|-------------|---------------------------|
| CNAME | `www`       | `USERNAME.github.io`      |
| A     | `@`         | `185.199.108.153`         |
| A     | `@`         | `185.199.109.153`         |
| A     | `@`         | `185.199.110.153`         |
| A     | `@`         | `185.199.111.153`         |

Delete any existing A / CNAME records for `@` and `www` that point to Wix first (Wix's are typically `23.236.62.147` or `cdn1.wixdns.net`). Leave MX / TXT records alone — those are for email.

Then, once DNS has propagated (minutes to a few hours):

```bash
# confirm DNS
dig +short www.genesishub.online CNAME      # → USERNAME.github.io.
dig +short genesishub.online A              # → the four 185.199.x.153 addresses

# turn on HTTPS enforcement (GitHub issues the certificate automatically)
gh api --method PUT "/repos/{owner}/genesishub-site/pages" -F https_enforced=true
```

If the GitHub Pages settings page shows "Domain's DNS record could not be retrieved", wait and retry — it's just propagation.

Only after `https://www.genesishub.online` shows the new site should you cancel the Wix site plan. Keep the domain registration itself.

## 3. Contact form (Formspree)

The form posts to Formspree in the background and shows a success / error message inline. Submissions arrive by email and are also kept in the Formspree dashboard.

Setup (one-time, ~5 minutes):

1. Sign up at https://formspree.io (use info@genesishub.online so notifications land in the shared inbox) and confirm the email.
2. **+ New form** → name it e.g. "GenesisHub Contact" → copy the endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. In `index.html`, the endpoint is the `action` URL on the `<form>` tag (currently `https://formspree.io/f/xjykywbr`). To switch forms, replace it there. If it is ever set back to `REPLACE_ME`, the button falls back to opening the visitor's mail app.
4. In the Formspree form settings, add `https://www.genesishub.online` under **Restrict to Domain** (blocks other sites from posting to your endpoint).
5. Commit and push, then send yourself a test message from the live site.

Fields sent: first-name, last-name, company, email, subject, message. The status messages shown to visitors are set per page via `data-msg-*` attributes on the `<form>`, so the Japanese and English pages each show their own wording. The visitor's `email` becomes the reply-to address automatically. `_gotcha` is a hidden honeypot for spam bots; `_language=ja` sets the Japanese UI for any Formspree-side prompts.

Free plan: 50 submissions/month, one form. Paid plans raise the limit and add file uploads, custom redirects, etc.

## 4. Content notes

- The office is a virtual office, so the address is deliberately not shown on the homepages or footers. It appears only in the 会社概要 table on `info.html`. Company facts (representative, founding date) live there too; the company name also appears in each page's footer.
- The English company name is rendered as "GenesisHub K.K." Change it in `en/index.html` and `info.html` if a different official English name is registered.
- The privacy policy exists in Japanese only; the English site links to it and says so.
