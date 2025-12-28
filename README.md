<img width="1840" height="976" alt="immagine" src="https://github.com/user-attachments/assets/59644abc-722f-4bde-a0b1-911a07ace20f" />

# 🎮 Server Manfredonia


**Server Manfredonia** è un’esperienza Minecraft moddata basata su **BetterMinecraft Fabric Edition**, arricchita da un **pannello di controllo web** per monitorare e gestire il server in tempo reale, e da un sistema di **accesso su whitelist** per garantire un ambiente di gioco sicuro e moderato.

---

## ✨ Caratteristiche principali

- 🌍 **Modpack BetterMinecraft Fabric**  
  - Nuove dimensioni, biomi e boss  
  - Magia avanzata (Botania, Ars Nouveau)  
  - Tecnologia (Create, Applied Energistics)  
  - Performance ottimizzate e miglioramenti grafici  

- 🔧 **Installazione semplificata**  
  - Supporto per CurseForge, Modrinth e SKLauncher  
  - Guida passo‑passo per importare il modpack  
  - Raccomandazione: almeno 8 GB di RAM  

- 🔒 **Whitelist e accesso**  
  - Modulo online per richiedere l’accesso  
  - Approvazione in 24 h  
  - Canale Discord dedicato  

- 📊 **Pannello di controllo web**  
  - Monitoraggio in tempo reale (TPS, giocatori online)  
  - Console live per log e comandi  
  - Controllo alimentazione: avvia, spegni, riavvia  
  - Integrazione Discord per notifiche  

- ⚙️ **Ottimizzazione & FAQ**  
  - Consigli RAM, mod performance (Optifine/Sodium)  
  - Pre‑generazione mondo e caricamento chunk  
  - Guida a crash, errori e mod consigliate  

---

CONFIGURAZIONE BANNER INFO
Ogni oggetto in infoBanners può avere queste proprietà:
"id": string             // identificatore univoco del banner
"enabled": boolean       // se true il banner viene mostrato
"title": string          // titolo principale del banner (puoi usare emoji)
"subtitle": string       // sottotitolo opzionale (può essere vuoto)
"message": string        // testo principale del banner
"icon": string           // nome icona (unicode, emoji o nome custom)
"style": string          // colore/stile del banner, valori possibili:
                         //   "banner-yellow" (giallo)
                         //   "banner-purple" (viola)
                         //   "banner-blue" (blu)
                         //   "banner-green" (verde)
                         //   "banner-red" (rosso)


Esempio:
{
  "id": "banner1",
  "enabled": true,
  "title": "Titolo banner",
  "subtitle": "",
  "message": "Testo del messaggio",
  "icon": "notification",
  "style": "banner-blue"
}
