# Hakiranje i kibernetička sigurnost — web izdanje

Statična web aplikacija (HTML + CSS + JS, bez build koraka). Sadržaj je u `data/content.json`.

## Postavljanje: GitHub → Netlify
1. Na GitHubu napravite novi repozitorij i pošaljite ove datoteke:
   ```bash
   git init && git add . && git commit -m "Prvo izdanje"
   git branch -M main
   git remote add origin https://github.com/<korisnik>/<repo>.git
   git push -u origin main
   ```
2. Netlify → **Add new site → Import an existing project → GitHub** → odaberite repozitorij.
3. Postavke: *Build command* ostaje prazno, *Publish directory* = `.` (već u `netlify.toml`). Deploy.
4. Svaki `git push` automatski objavljuje novu verziju.

## Lokalno
`python3 -m http.server 8000` pa otvorite http://localhost:8000

## Funkcije
Čitač poglavlja i dodataka, pretraga, praćenje napretka, radna bilježnica s bilješkama i kvačicama (localStorage), tamni/svijetli način, prilagodba mobitelu.
