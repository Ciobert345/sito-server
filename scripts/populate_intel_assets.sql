-- Script per popolare la tabella intel_assets
-- Esegui questo script nella SQL Editor di Supabase
-- 
-- Struttura tabella:
-- id (uuid, primary key, default gen_random_uuid())
-- name (text, not null)
-- description (text, nullable)
-- image_url (text, not null)
-- required_clearance (integer, nullable)
-- unlock_code (text, nullable, unique)

-- Esempio di inserimento intel assets
-- Puoi modificare i valori secondo le tue esigenze

INSERT INTO intel_assets (name, description, image_url, unlock_code, required_clearance) VALUES
-- Intel per livello 1 (sbloccati automaticamente al livello 1)
('Intel Base', 'Documento di base del sistema Manfredonia', 'https://via.placeholder.com/400x300/10b981/ffffff?text=Intel+Base', NULL, 1),
('Documento Classificato L1', 'Primo documento riservato del sistema', 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Doc+L1', NULL, 1),

-- Intel per livello 2 (sbloccati automaticamente al livello 2)
('File Segreto L2', 'File riservato di livello operativo', 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=File+L2', NULL, 2),
('Report Operativo', 'Report delle operazioni recenti', 'https://via.placeholder.com/400x300/ec4899/ffffff?text=Report', NULL, 2),

-- Intel per livello 3 (sbloccati automaticamente al livello 3)
('Dati Critici L3', 'Dati critici del sistema di sicurezza', 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Dati+L3', NULL, 3),
('Archivio Riservato', 'Archivio contenente informazioni sensibili', 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Archivio', NULL, 3),

-- Intel per livello 4 (sbloccati automaticamente al livello 4)
('Informazioni Elite', 'Informazioni riservate per agenti elite', 'https://via.placeholder.com/400x300/14b8a6/ffffff?text=Elite', NULL, 4),
('Progetto Omega', 'Documentazione del progetto Omega', 'https://via.placeholder.com/400x300/6366f1/ffffff?text=Omega', NULL, 4),

-- Intel per livello 5 (sbloccati automaticamente al livello 5)
('Ultimo Segreto', 'Il segreto finale del sistema Manfredonia', 'https://via.placeholder.com/400x300/d946ef/ffffff?text=Ultimo', NULL, 5),

-- Intel sbloccabili tramite codici (senza required_clearance)
('Intel Kortex', 'Intel correlato al sistema Kortex', 'https://via.placeholder.com/400x300/10b981/ffffff?text=Kortex', 'KORTEX2026', NULL),
('Intel Mole', 'Intel correlato al sistema Mole Killer', 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Mole', 'MOLE_KILLER', NULL),
('Intel Void', 'Intel correlato al sistema Void Invader', 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Void', 'VOID_INVADER', NULL),
('Intel Cyber', 'Intel correlato al sistema Cyber Jack', 'https://via.placeholder.com/400x300/ec4899/ffffff?text=Cyber', 'CYBER_JACK', NULL),

-- Altri intel con codici personalizzati
('Intel Segreto Alpha', 'Documento segreto classificato Alpha', 'https://via.placeholder.com/400x300/f59e0b/ffffff?text=Alpha', 'ALPHA2026', NULL),
('Intel Segreto Beta', 'Documento segreto classificato Beta', 'https://via.placeholder.com/400x300/ef4444/ffffff?text=Beta', 'BETA2026', NULL),
('Intel Segreto Gamma', 'Documento segreto classificato Gamma', 'https://via.placeholder.com/400x300/14b8a6/ffffff?text=Gamma', 'GAMMA2026', NULL);

-- Nota: 
-- - Gli intel con required_clearance vengono sbloccati automaticamente quando si raggiunge quel livello
-- - Gli intel con unlock_code possono essere sbloccati tramite il comando "unlock <code>" nel terminale
-- - Gli intel possono avere sia required_clearance che unlock_code (sbloccabili in entrambi i modi)
-- - Sostituisci gli URL placeholder con URL reali delle tue immagini
-- - Il campo description è opzionale ma consigliato per fornire più contesto

