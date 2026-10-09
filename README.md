# BCT Travel – bct-travel.com

Faqja e agjencisë BCT Travel, me:
- globin 3D dhe 13 paketat e pushimeve;
- kërkimin e fluturimeve nga Prishtina;
- portalin B2B dhe panelin e administrimit;
- botin që merr çmimet nga Flytik.

## Çfarë ka brenda

| Dosja | Për çfarë shërben |
|---|---|
| `site/` | **Faqja e gatshme**: `index.html` (faqja) dhe `admin.html` (paneli). Kjo publikohet. |
| `src/` | Kodi burimor i faqes dhe i panelit. Pas çdo ndryshimi nisni `python3 src/build.py`, që përditëson `site/`. |
| `service-24-7/` | Shërbimi në Cloudflare (Worker). Ruan çmimet, ndryshimet e panelit dhe fotot, dhe bën kërkimin "Gjej fluturimet". |
| `flytik-bot/` | Boti që hyn në Flytik me user dhe password. Punon vetë në GitHub Actions. |
| `.github/workflows/flytik.yml` | Orari i botit: çdo 3 orë. Niset vetëm kur `FLYTIK_ENABLED = true`. |

## Radha e ngritjes

1. **Shërbimi 24/7:** ndiqni `service-24-7/README.md`. Aty krijoni Worker-in, KV, fjalëkalimin e panelit (`ADMIN_PASSWORD`) dhe `ALLOWED_ORIGINS`.
2. **Adresa e shërbimit:** vendoseni te `src/data.js`, te `priceApi`. Pastaj nisni `python3 src/build.py`, ose ndryshojeni direkt te `site/index.html`.
3. **Faqja në Cloudflare Pages, nga GitHub:**
   1. Te **Workers & Pages → Create → Pages → Connect to Git**, zgjidhni repo-n `bct-travel`.
   2. Te **Build output directory** shkruani `site`. Komandën e ndërtimit e lini bosh.
   3. Pas kësaj, çdo `push` te `main` e publikon faqen vetë.
4. **Domain-i `bct-travel.com`:** shihni `service-24-7/README.md`, pjesën "Lidhja me bct-travel.com". Kujdes me regjistrimet MX të email-it.
5. **Boti i Flytik:** ndiqni `flytik-bot/README.md`. Secrets dhe Variables vendosen te ky repo.

## Siguria

- Mbajeni këtë repo **Private**.
- Asnjë fjalëkalim ose token nuk shkruhet në kod. Ato vendosen vetëm te:
  - **GitHub:** Settings → Secrets and variables → Actions;
  - **Cloudflare:** Worker → Settings → Variables and Secrets.
- Çmimet dhe fotot i ndryshoni nga paneli (`/admin.html`), pa prekur kodin.

## Kontakt në faqe

info@bct-travel.com · +383 48 667 888 (WhatsApp)
