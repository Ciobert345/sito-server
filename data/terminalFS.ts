export interface FSNode {
    name: string;
    type: 'file' | 'dir';
    content?: string;
    children?: FSNode[];
    permissions?: string;
    lastModified?: string;
}

export const TERMINAL_FS: FSNode = {
    name: '/',
    type: 'dir',
    children: [
        {
            name: 'bin',
            type: 'dir',
            permissions: 'drwxr-xr-x',
            lastModified: '2026-01-20 10:00',
            children: [
                { name: 'ls', type: 'file', permissions: '-rwxr-xr-x', content: '[BINARY-DATA: LIST_NODES]' },
                { name: 'cd', type: 'file', permissions: '-rwxr-xr-x', content: '[BINARY-DATA: CHANGE_DIR]' },
                { name: 'cat', type: 'file', permissions: '-rwxr-xr-x', content: '[BINARY-DATA: READ_STREAM]' }
            ]
        },
        {
            name: 'home',
            type: 'dir',
            permissions: 'drwxr-xr-x',
            lastModified: '2026-01-21 09:15',
            children: [
                {
                    name: 'admin',
                    type: 'dir',
                    permissions: 'drwx------',
                    children: [
                        {
                            name: 'readme.txt',
                            type: 'file',
                            content: 'Benvenuto nel Manfredonia Shell.\n\nEsplora il sistema per trovare i codici segreti.\nInserisci i codici nel prompt per avviare i minigiochi.\nCompleta i giochi correttamente per ottenere XP.\nGli XP sbloccano informazioni riservate nel database Intel.\n\nBuona fortuna, Operativo.'
                        }
                    ]
                }
            ]
        },
        {
            name: 'sys',
            type: 'dir',
            permissions: 'dr-xr-xr-x',
            children: [
                {
                    name: 'kernel',
                    type: 'dir',
                    children: [
                        {
                            name: 'manifest.log',
                            type: 'file',
                            content: 'CRITICAL_REF: VOID_INVADER\nPRIORITY: OMEGA\nSTATUS: ACTIVE'
                        }
                    ]
                }
            ]
        },
        {
            name: 'var',
            type: 'dir',
            children: [
                {
                    name: 'log',
                    type: 'dir',
                    children: [
                        {
                            name: 'security.log',
                            type: 'file',
                            content: '[2026-01-23 18:44:12] WARNING: Rilevato tentativo di accesso non autorizzato.\n[2026-01-23 18:44:15] TRACCIA_IDENTIFICATA: MOLE_KILLER\n[2026-01-23 18:44:20] Connessione terminata d\'ufficio.'
                        }
                    ]
                }
            ]
        },
        {
            name: 'usr',
            type: 'dir',
            children: [
                {
                    name: 'secrets',
                    type: 'dir',
                    permissions: 'drwx------',
                    children: [
                        {
                            name: 'kortex_protocol.dat',
                            type: 'file',
                            content: 'PROTOCOL_INIT: KORTEX2026\nLEVEL: ENCRYPTED\nSECURITY_GATE: REQ_BYPASS'
                        }
                    ]
                }
            ]
        },
        {
            name: 'data',
            type: 'dir',
            children: [
                {
                    name: 'archives',
                    type: 'dir',
                    children: [
                        {
                            name: 'cyber_ledger.bin',
                            type: 'file',
                            content: 'FRAGMENT_09:\nCYBER_JACK\nSOURCE: VAULT_7'
                        }
                    ]
                }
            ]
        },
        {
            name: 'mnt',
            type: 'dir',
            permissions: 'drwxr-xr-x',
            children: [
                {
                    name: 'intel',
                    type: 'dir',
                    permissions: 'dr-xr-xr-x',
                    children: [] // Dynamically populated in Terminal.tsx
                }
            ]
        }
    ]
};
