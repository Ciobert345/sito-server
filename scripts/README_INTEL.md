# Come popolare la tabella intel_assets

## Struttura della tabella

La tabella `intel_assets` deve avere questi campi:

```sql
CREATE TABLE intel_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  unlock_code TEXT UNIQUE,
  required_clearance INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Metodi di sblocco

Gli intel possono essere sbloccati in due modi:

### 1. Sblocco automatico per livello
- Imposta il campo `required_clearance` (1-5)
- L'intel viene sbloccato automaticamente quando l'utente raggiunge quel livello
- Esempio: `required_clearance: 3` → sbloccato quando si raggiunge il livello 3

### 2. Sblocco tramite codice
- Imposta il campo `unlock_code` (deve essere unico)
- L'utente può sbloccare l'intel usando il comando `unlock <code>` nel terminale
- Esempio: `unlock_code: 'KORTEX2026'` → sbloccato con `unlock KORTEX2026`

### 3. Entrambi i metodi
- Un intel può avere sia `required_clearance` che `unlock_code`
- In questo caso può essere sbloccato in entrambi i modi

## Come inserire i dati

### Opzione 1: SQL Editor di Supabase
1. Vai su Supabase Dashboard → SQL Editor
2. Copia e incolla il contenuto di `populate_intel_assets.sql`
3. Modifica gli URL delle immagini e i codici secondo le tue esigenze
4. Esegui lo script

### Opzione 2: Table Editor di Supabase
1. Vai su Supabase Dashboard → Table Editor
2. Seleziona la tabella `intel_assets`
3. Clicca su "Insert row"
4. Compila i campi:
   - **name**: Nome dell'intel
   - **description**: (opzionale) Descrizione dell'intel
   - **image_url**: URL dell'immagine (può essere un URL esterno o un path di Supabase Storage)
   - **unlock_code**: (opzionale) Codice per sbloccare manualmente
   - **required_clearance**: (opzionale) Livello richiesto per sblocco automatico (1-5)

### Opzione 3: Supabase Storage per le immagini
1. Vai su Supabase Dashboard → Storage
2. Crea un bucket chiamato `intel-assets` (se non esiste)
3. Carica le immagini
4. Copia l'URL pubblico di ogni immagine
5. Usa quegli URL nel campo `image_url` della tabella

## Esempio di inserimento

```sql
INSERT INTO intel_assets (name, description, image_url, unlock_code, required_clearance) VALUES
('Intel Segreto', 'Descrizione dell''intel segreto', 'https://tuo-dominio.com/intel1.jpg', 'SECRET123', 2);
```

## Verifica

Dopo aver inserito i dati, puoi verificare che funzionino:
1. Apri il terminale e prova `unlock <codice>` per gli intel con unlock_code
2. Salendo di livello, gli intel con required_clearance dovrebbero sbloccarsi automaticamente
3. Vai su Account → Clearance Access per vedere gli intel sbloccati

