# Puhelinluettelo backend

Full Stack Open ‑kurssin osan 3 puhelinluettelosovelluksen backend.

## Tuotantoversio

Sovellus on saatavilla osoitteessa: https://full-stack-4m99.onrender.com

## Käytetyt teknologiat

- Node.js
- Express
- morgan (loggaus)
- cors (Cross-Origin Resource Sharing)

## Skriptit

- `npm start` – käynnistää sovelluksen tuotantomoodissa
- `npm run dev` – käynnistää sovelluksen kehitysmoodissa nodemonin kanssa
- `npm run build:ui` – luo frontendin tuotantoversion ja kopioi sen backendin alle
- `npm run deploy:full` – kääntää frontendin ja deployaa Renderiin git pushilla

## API-päätepisteet

| Metodi | Polku                | Toiminto                       |
| ------ | -------------------- | ------------------------------ |
| GET    | `/api/persons`       | Listaa kaikki                  |
| GET    | `/api/persons/:id`   | Hae yksittäinen                |
| GET    | `/info`              | Näyttää statistiikat           |
| POST   | `/api/persons`       | Lisää uusi                     |
| DELETE | `/api/persons/:id`   | Poista                         |
