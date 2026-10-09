# Çmimet e fluturimeve 24/7 – BCT Travel

Ky është një shërbim i vogël në Cloudflare që punon gjithë kohën.

**Kërkimi live.** Kur klienti zgjedh qytetin, datat dhe udhëtarët dhe shtyp **Gjej fluturimet**, shërbimi pyet kompanitë ajrore përmes Duffel në atë moment. Në pak sekonda klienti sheh fluturimet: orët, nëse janë direkte, çmimin, dhe butonin **Rezervo**. Rezervo ju dërgon fluturimin e saktë në WhatsApp.

**Kontrolli çdo orë.** Gjithë ditën e natën, çdo orë, shërbimi kontrollon disa qytete me radhë. Kështu çmimet "nga 89 €" pranë qyteteve rifreskohen vetë çdo ditë.

Shërbimi nuk ka nevojë për kompjuter të ndezur. Cloudflare e mban gjallë 24/7.

> Kjo paketë e zëvendëson paketën e mëparshme me GitHub (`bct-price-bot`). Atë nuk e keni më nevojë.

## Çfarë ka brenda

| Skedari | Për çfarë shërben |
|---|---|
| `worker.js` | Shërbimi 24/7 |
| `index.html` | Faqja e BCT Travel, gati për kërkimin live |
| `admin.html` | Paneli i administrimit: çmimet, datat, tekstet dhe fotot e ofertave |
| `wrangler.toml` | Vetëm nëse e vendosni me komandë. Nga paneli nuk ju duhet |

## Çfarë ju duhet

- Një llogari falas në **Cloudflare** (cloudflare.com).
- Çmimet vijnë nga një prej këtyre burimeve, ose nga të dyja:
  - **Boti i Flytik** (paketa `bct-flytik-bot`): hyn me user dhe password në Flytik dhe dërgon çmimet ditë për ditë për 30 ditët e ardhshme. Këto kanë përparësi.
  - **Duffel** (opsional): kërkim live te kompanitë ajrore, për datat më larg ose qytetet që Flytik nuk i ka. Ju duhet një token nga Dashboard → test mode → Access tokens.

---

## Hapi 1 – Krijoni Worker-in

1. Në Cloudflare hapni **Workers & Pages** dhe shtypni **Create**.
2. Zgjidhni **Create Worker**. Emri: `bct-flights`. Shtypni **Deploy**.
3. Shtypni **Edit code**. Fshini kodin që është aty dhe ngjitni gjithë `worker.js`.
4. Shtypni **Deploy**.
5. Kopjoni adresën e Worker-it, p.sh. `https://bct-flights.EMRI.workers.dev`.

## Hapi 2 – Hapësira ku ruhen çmimet (KV)

1. Te **Workers & Pages → KV** (ose **Storage & Databases → KV**), krijoni një hapësirë me emrin `BCT_PRICES`.
2. Kthehuni te Worker-i `bct-flights`.
3. Hapni **Settings → Bindings** dhe shtypni **Add**.
4. Zgjidhni **KV namespace**. Te **Variable name** shkruani `PRICES` dhe zgjidhni `BCT_PRICES`.

## Hapi 3 – Token-i dhe cilësimet

Te Worker-i hapni **Settings → Variables and Secrets** dhe shtoni:

| Emri | Lloji | Vlera |
|---|---|---|
| `DUFFEL_TOKEN` | **Secret** | token-i i Duffel (vetëm nëse përdorni Duffel) |
| `ADMIN_PASSWORD` | **Secret** | fjalëkalimi i panelit të administrimit. Zgjidhni një të gjatë, me shkronja, numra dhe shenja |
| `INGEST_KEY` | **Secret** | fjala e fshehtë që përdor boti i Flytik për të dërguar çmimet; e njëjta vlerë si te GitHub |
| `ALLOWED_ORIGINS` | Text | `https://bct-travel.com,https://www.bct-travel.com` dhe adresa e faqes në hapin 5 |
| `REFRESH_KEY` | Secret | një fjalë e fshehtë, p.sh. `bct-2026-rifresko` (opsionale) |

## Hapi 4 – Orari: çdo orë (vetëm me Duffel)

Nëse përdorni vetëm botin e Flytik, kalojeni këtë hap: boti niset vetë nga GitHub.


1. Te Worker-i hapni **Settings → Triggers** dhe shtypni **Add Cron Trigger**.
2. Shkruani `0 * * * *`. Kjo do të thotë çdo orë, në minutën 0. Ruajeni.

**Provë e menjëhershme**, pa pritur një orë: hapni në shfletues `https://bct-flights.EMRI.workers.dev/refresh?key=FJALA-JUAJ`. Pastaj hapni `.../prices` dhe do të shihni çmimet e para.

## Hapi 5 – Lidhni faqen me shërbimin dhe publikojeni

1. Hapni `index.html` me Notepad (Windows) ose TextEdit (Mac).
2. Kërkoni `priceApi: ''`.
3. Vendosni adresën e Worker-it brenda thonjëzave: `priceApi: 'https://bct-flights.EMRI.workers.dev'`. Ruajeni.
4. Publikojeni faqen te **Workers & Pages → Create → Pages → Upload assets**. Ngarkoni bashkë `index.html` dhe `admin.html` dhe shtypni **Deploy**.
5. Shtoni adresën që merrni, p.sh. `https://bct-travel.pages.dev`, te `ALLOWED_ORIGINS` në hapin 3.
6. Për domain-in tuaj, shihni më poshtë **"Lidhja me bct-travel.com"**.

Kur faqja ka adresën e Worker-it, te forma e fluturimeve shfaqet butoni i kuq **Gjej fluturimet**. Pa adresën, faqja punon si më parë, me kërkesa në WhatsApp.

## Hapi 6 – Kalimi në çmime reale

Në test mode, çmimet vijnë nga një kompani fiktive dhe faqja shkruan "çmime prove". Për çmime reale:

1. Plotësoni hapat për **Live Mode** te Duffel.
2. Krijoni token-in **live**.
3. Zëvendësoni `DUFFEL_TOKEN` te Worker-i me token-in live.

---

## Cilësime që mund t'i ndryshoni

Shtohen te **Variables and Secrets**, si Text.

| Emri | Parazgjedhja | Çfarë bën |
|---|---|---|
| `BATCH` | `3` | Sa kontrolle bëhen çdo orë. Më shumë kontrolle = çmime më të freskëta, por kosto më e lartë te Duffel |
| `DAYS_AHEAD` | `10,24` | Pas sa ditësh kontrollohen datat për çmimet "nga" |
| `MAX_CONNECTIONS` | `0` | `0` = vetëm fluturime direkte; `1` = edhe me një ndalesë |

Me parazgjedhjet, çdo qytet kontrollohet rreth një herë në ditë për secilën nga dy datat. Kërkimi live, nga ana tjetër, është gjithmonë i atij momenti.

## Mbrojtja

- **Token-i** qëndron vetëm te Cloudflare si Secret. Kurrë mos e vendosni te `index.html`.
- **Faqe të tjera:** shërbimi i përgjigjet vetëm faqeve te `ALLOWED_ORIGINS`.
- **Kërkime të njëjta:** e njëjta kërkesë ruhet 30 minuta. Kështu kërkimet e përsëritura nuk ju kushtojnë.
- **Teprimet:** një person nuk mund të bëjë më shumë se rreth 20 kërkime në 10 minuta. Shihni herë pas here përdorimin te paneli i Duffel.

## Sa kushton

- **Cloudflare:** plani falas jep 100.000 kërkesa në ditë dhe 10 ms kohë procesori për çdo kërkesë. Kjo mjafton për fillim. Nëse te **Metrics → Errors** shihni "Exceeded CPU Time Limits", kaloni në planin me pagesë të Workers.
- **Duffel:** kërkimet janë falas deri në 1.500 për çdo rezervim të bërë përmes Duffel. Mbi këtë, 0,005 $ për kërkim. Llogaritje e përafërt pa asnjë rezervim:
  - 3 kontrolle në orë ≈ 2.200 kërkime në muaj, rreth 11 $.
  - Plus kërkimet e klientëve: 100 në ditë ≈ 3.000 në muaj, rreth 15 $.

## Kur diçka nuk shkon

| Çfarë shihni | Çfarë do të thotë |
|---|---|
| "Mungon DUFFEL_TOKEN" | Secret-i nuk quhet saktësisht `DUFFEL_TOKEN`. |
| "Nuk lejohet." | Adresa e faqes mungon te `ALLOWED_ORIGINS`. |
| "Kërkimi nuk u krye" | Duffel nuk u përgjigj. Logun e shihni te Worker-i, në **Logs**. |
| `/prices` bosh | Orari nuk është shtuar, ose KV nuk quhet `PRICES`. Provoni `/refresh?key=...`. |
| Asnjë fluturim për një qytet | Atë ditë nuk ka fluturim direkt, ose kompania nuk është te Duffel. Pyesni Duffel për kompanitë nga Prishtina, sidomos Wizz Air. |

---

## Paneli i administrimit

**Adresa:** `https://bct-travel.com/admin.html`. Hyni me fjalëkalimin `ADMIN_PASSWORD`. Herën e parë paneli ju kërkon edhe adresën e shërbimit 24/7; pastaj e mban mend.

**Çfarë mund të ndryshoni për çdo ofertë:**
- **Çmimet:** çmimin "nga" dhe çmimin e vjetër. Kur vendosni çmim të vjetër, faqja e tregon të vizatuar me "Ulje −X%".
- **Tekstet:** titullin, etiketën, përshkrimin, netët, akomodimin, ushqimin dhe pikat kryesore.
- **Datat:** datat e nisjes dhe vendet e lira. Oferta pa data në të ardhmen nuk shfaqet.
- **Fotoja:** ngarkoni një foto nga kompjuteri, ose zgjidhni një nga të gatshmet. Pastaj klikoni mbi foto ku është pjesa më e rëndësishme. Paneli e zvogëlon foton vetë para ngarkimit.
- **Shfaqja:** e fshehni ose e shfaqni ofertën me një çelës.
- **Dupliko:** krijon një ofertë të re nga një ekzistuese, p.sh. një hotel tjetër në Antalya me çmim tjetër. Kopjet mund të fshihen.

**Si ruhen ndryshimet:**
1. Shtypni **Ruaj** te dritarja e ofertës.
2. Kur të keni mbaruar, shtypni **Publiko në faqe**. Faqja përditësohet brenda një minute.
3. **Rikthe origjinalin** e kthen një ofertë siç ishte në fillim.

**Siguria:**
- Fjalëkalimi kontrollohet vetëm te shërbimi në Cloudflare.
- Hyrja vlen 12 orë.
- Pas 20 përpjekjeve të gabuara në 10 minuta, hyrja bllokohet përkohësisht.
- Për ta ndryshuar fjalëkalimin, ndryshoni `ADMIN_PASSWORD` te Worker-i. Të gjitha hyrjet e vjetra mbyllen menjëherë.

---

## Lidhja me bct-travel.com

**1. Shtoni domain-in në Cloudflare (falas).**

Te paneli i Cloudflare shtypni **Add a domain**, shkruani `bct-travel.com` dhe zgjidhni planin **Free**.

Cloudflare i lexon vetë regjistrimet DNS që keni sot.

> **Kujdes me email-in:** kontrolloni që në listë të jenë regjistrimet **MX** dhe **TXT** të email-it tuaj. Pa to, `info@bct-travel.com` ndalon së punuari. Nëse mungojnë, kopjojini nga paneli ku e keni blerë domain-in.

**2. Ndryshoni nameserver-at.**

Cloudflare ju jep dy nameserver-a, p.sh. `ana.ns.cloudflare.com`. Hyni te kompania ku keni blerë domain-in dhe zëvendësoni nameserver-at me këta dy. Aktivizimi zgjat zakonisht disa orë, ndonjëherë deri në 24.

**3. Lidheni faqen.**

Te projekti Pages hapni **Custom domains → Set up a custom domain**. Shtoni `bct-travel.com`, pastaj edhe `www.bct-travel.com`. Cloudflare i vendos vetë regjistrimet DNS dhe certifikatën HTTPS.

**4. Lejoni domain-in te shërbimi.**

Te Worker-i, te `ALLOWED_ORIGINS`, shkruani:

```
https://bct-travel.com,https://www.bct-travel.com
```

**5. Përditësimet e faqes më vonë.**

Te projekti Pages shtypni **Create deployment** dhe ngarkoni sërish skedarët. Çmimet dhe fotot nuk kanë nevojë për këtë: ato i ndryshoni nga paneli.
