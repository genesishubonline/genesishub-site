# GenesisHub株式会社 — website

Static site for https://www.genesishub.online, migrated from Wix to GitHub Pages.

```
index.html            ホーム
info.html             会社情報       (also served at /info)
privacypolicy.html    プライバシーポリシー (also served at /privacypolicy)
style.css             all styles
images/               site images
CNAME                 custom domain for GitHub Pages (www.genesishub.online)
.nojekyll             tells GitHub Pages to serve files as-is
```

Editing: open the `.html` file, change the text, commit, push. GitHub Pages redeploys in about a minute.

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

## 3. Contact form

Wix hosted the old form. On a static site there is no server, so right now the Submit button opens the visitor's mail app addressed to info@genesishub.online with the fields pre-filled.

To get a real form that emails you instead:

1. Create a free form at https://formspree.io (sign up with info@genesishub.online), copy the form endpoint (looks like `https://formspree.io/f/abcdwxyz`).
2. In `index.html`, replace `https://formspree.io/f/REPLACE_ME` with that URL. The mailto fallback switches itself off automatically.
3. Commit and push.

## 4. Known content notes (carried over from Wix as-is)

- Under **GenesisHubの強み**, the descriptions for 伴走型支援 and 柔軟性 are duplicates of the Translation and Business Matching service texts (this was already the case on Wix). Worth rewriting.
- "Our strenghts" is spelled that way on the original site.
- The **Services offered** section on Wix was a 2-slide slideshow (Spekter Agency / Animix Snap); here both are shown side by side.
