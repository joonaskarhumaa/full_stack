# Bloglist E2E -testit

Playwright-pohjaiset end-to-end -testit tehtäviä 5.17–5.23 varten.

## Käyttöönotto kerran

```
npm install
npx playwright install
```

## Testien ajaminen

E2E-testit edellyttävät että:

1. **Backend** osa_4/blogilista pyörii portissa 3003 **NODE_ENV=test**:llä
   ```
   cd ../../osa_4/blogilista
   NODE_ENV=test npm run dev
   ```
   Tämä käyttää testitietokantaa ja aktivoi `/api/testing/reset`-endpointin.

2. **Frontend** osa_5/bloglist-frontend pyörii portissa 5173
   ```
   cd ../bloglist-frontend
   npm run dev
   ```

3. Aja testit toiseen terminaaliin:
   ```
   npm test
   ```

## Hyödyllisiä komentoja

- `npm test` – ajaa testit headlessina
- `npx playwright test --ui` – avaa Playwrightin interaktiivisen UI:n
- `npx playwright test --debug` – debug-mode
- `npm run test:report` – avaa HTML-raportin viimeisestä ajosta
