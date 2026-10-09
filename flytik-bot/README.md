# Boti i Flytik – BCT Travel

Ky bot hyn në Flytik me user-in dhe password-in tuaj, njësoj si ju, dhe merr çmimet vetë.

**Si funksionon:**

1. Çdo 3 orë, ditë e natë, boti hyn në Flytik.
2. Për çdo destinacion nga Prishtina lexon çmimet ditë për ditë, për vajtje dhe kthim, për 30 ditët e ardhshme. Fluturimet "E shitur" i anashkalon.
3. Shton markup-un tuaj dhe ia dërgon çmimet shërbimit 24/7 në Cloudflare (paketa `bct-flights-24-7`).
4. Faqja tregon "nga 58 CHF" pranë qyteteve.
5. Kur klienti shtyp **Gjej fluturimet**, sheh menjëherë fluturimet e asaj dite, me orët dhe çmimin.

## Para se të filloni

- **Pyesni Flytik** nëse e lejojnë hyrjen automatike dhe shfaqjen e çmimeve të tyre në faqen tuaj. Nëse kanë API ose XML për agjencitë, është edhe më mirë: boti hyn me të njëjtin user dhe password, por pa u prishur kur ndryshon pamja e faqes.
- **Përdorues i veçantë:** nëse mundeni, kërkoni nga Flytik një përdorues vetëm për botin.
- **Kodet në hyrje:** nëse Flytik nis të kërkojë kod me SMS ose CAPTCHA, boti nuk mund të hyjë vetë.
- **Mos ia jepni askujt password-in.** Ai vendoset vetëm te "secrets" në GitHub.

## Çfarë ju duhet

- Shërbimi 24/7 nga paketa `bct-flights-24-7`, i ngritur në Cloudflare. Ju duhet adresa e tij, p.sh. `https://bct-flights.EMRI.workers.dev`.
- Një llogari falas në GitHub.
- Një fjalë e fshehtë e zgjedhur nga ju, p.sh. `bct-cmimet-2026-x7`. Ky është **INGEST_KEY** dhe vendoset njësoj në dy vende.

---

## Hapi 1 – Projekti në GitHub

Boti dhe orari i tij janë tashmë brenda projektit `bct-travel`:
- kodi te `flytik-bot/`;
- orari te `.github/workflows/flytik.yml`.

Mjafton që projekti të jetë publikuar në GitHub si **Private**. Të gjitha cilësimet më poshtë bëhen te ky projekt.

## Hapi 2 – Të dhënat e fshehta

Hapni **Settings → Secrets and variables → Actions**.

Te skeda **Secrets**, shtoni:

| Emri | Vlera |
|---|---|
| `FLYTIK_USER` | user-i juaj në Flytik |
| `FLYTIK_PASS` | password-i juaj në Flytik |
| `INGEST_KEY` | fjala e fshehtë që zgjodhët |

Te skeda **Variables**, shtoni:

| Emri | Vlera |
|---|---|
| `WORKER_URL` | adresa e shërbimit 24/7 |
| `MARKUP_PERCENT` | p.sh. `0` ose `5`: përqindja që shtoni mbi çmimin e Flytik |
| `MARKUP_FIXED` | p.sh. `10`: shuma fikse që shtoni për çdo biletë |
| `FLYTIK_ENABLED` | `true`. Vendoseni vetëm pasi të keni shtuar të gjitha të mësipërmet. Deri atëherë boti nuk niset. |

## Hapi 3 – Çelësi te shërbimi 24/7

Në Cloudflare, te Worker-i `bct-flights`, hapni **Settings → Variables and Secrets**. Shtoni `INGEST_KEY` si **Secret**, me të njëjtën fjalë si në GitHub.

Kjo mbron shërbimin: vetëm boti juaj mund të dërgojë çmime.

## Hapi 4 – Prova e parë (me diagnostikim)

1. Te GitHub hapni **Actions → Boti Flytik → Run workflow**.
2. Shënoni **debug** dhe te **only** shkruani `BSL`. Shtypni **Run workflow**.
3. Pas 2–3 minutash hapni nisjen. Në log duhet të shihni:
   ```
   Hyrja: OK
   Destinacione: 25
   BSL: 30 ditë, … fluturime vajtje, … kthim
   ```
4. Poshtë, te **Artifacts**, shkarkoni **diagnostikim**. Aty janë fotot e çdo hapi (hyrja, forma) dhe `flytik.json` me çmimet që lexoi boti. Krahasojini me Flytik.

> Boti i gjen fushat sipas teksteve të faqes: "Fjalëkalimi", "Login", "Prishtina (PRN)", "Kërko udhëtimin", "Gjithsejt". U provua me një kopje të Flytik të ndërtuar nga fotot tuaja. Nëse faqja e vërtetë ka diçka ndryshe dhe prova dështon, më dërgoni skedarët `.html` nga **diagnostikim** dhe e përshtat saktë.

## Hapi 5 – Lëreni të punojë vetë

Pas provës së suksesshme nuk duhet të bëni asgjë. Boti niset vetë çdo 3 orë. Shihni rezultatin te faqja: zgjidhni p.sh. Basel dhe shtypni **Gjej fluturimet**.

---

## Si ndahet puna me shërbimin 24/7

- **Qytetet që ka Flytik:** çmimet vijnë nga boti, për 30 ditët e ardhshme. Këta qytete kanë përparësi.
- **Datat përtej 30 ditëve, ose qytetet që Flytik nuk i ka:** nëse keni Duffel, kërkohet live te Duffel. Përndryshe klientit i del "na shkruani në WhatsApp".
- **Nëse përdorni vetëm Flytik:** nuk ju duhet Duffel fare. Mos vendosni `DUFFEL_TOKEN` dhe mos shtoni orarin (Cron) te Worker-i.

## Cilësimet që mund t'i ndryshoni

Shtohen te **Variables**.

| Emri | Parazgjedhja | Çfarë bën |
|---|---|---|
| `WINDOWS` | `8,23` | Qendrat e kërkimeve, në ditë nga sot. `8,23` mbulon 30 ditë. `8,23,38` mbulon 45 ditë, me më shumë kërkime. |
| `FLYTIK_URL` | `https://www.flytik.com/` | Adresa e faqes së hyrjes |
| `SEARCH_URL` | bosh | Adresa e faqes "Kërko udhëtimin", nëse boti nuk e gjen vetë |
| `PAUSE_MS` | `1500` | Pushimi mes kërkimeve, që të mos ngarkohet Flytik |

**Orari** ndryshohet te `flytik.yml`, në rreshtin `cron`:
- `15 */3 * * *` do të thotë çdo 3 orë.
- `15 */2 * * *` do të thotë çdo 2 orë.

## Sa kushton

- **GitHub:** projektet private kanë rreth 2.000 minuta falas në muaj. Një nisje zgjat rreth 5–6 minuta (llogaritje e përafërt, varet nga shpejtësia e Flytik). Çdo 3 orë del rreth 1.300–1.500 minuta në muaj, pra brenda planit falas.
- **Cloudflare:** falas.
- **Flytik:** asnjë kosto shtesë, por mos e ulni pushimin dhe mos e shpeshtoni orarin pa nevojë.

## Siguria

- **Password-i** qëndron vetëm te GitHub Secrets. Nuk shfaqet as në log.
- **Logu** nuk tregon çmime, vetëm sa ditë dhe fluturime u lexuan.
- **Diagnostikimi** ruhet 3 ditë dhe e shihni vetëm ju, sepse projekti është privat. Mos e bëni projektin publik.

## Kur diçka nuk shkon

| Mesazhi | Çfarë të bëni |
|---|---|
| `Hyrja dështoi` | Kontrolloni `FLYTIK_USER` dhe `FLYTIK_PASS`. Ose Flytik kërkon kod/CAPTCHA. |
| `Nuk e gjeta formën e kërkimit` | Hyni vetë në Flytik, kopjoni adresën e faqes "Kërko udhëtimin" dhe vendoseni te `SEARCH_URL`. |
| `Nuk i gjeta fushat e datave` / `butonin` / `nuk u gjet tabela` | Nisni me **debug** dhe më dërgoni skedarët `.html`. |
| `Shërbimi ktheu 403` | `INGEST_KEY` nuk është i njëjtë te GitHub dhe te Cloudflare. |
| `Shërbimi ktheu 500: Mungon KV` | Te Worker-i mungon lidhja KV `PRICES` (shihni udhëzimin e shërbimit 24/7, hapi 2). |
