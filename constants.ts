
import { RoadmapStatus, RoadmapItem, Config } from './types';

export const APP_CONFIG: Partial<Config> = {
  targetDate: '2025-12-31T20:00:00', // Example future date
  serverIp: 'play.manfredonia.com',
  modpackVersion: 'v2.5',
  githubRepo: 'manfredonia/industrial-modpack'
};

export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: '1',
    title: '1.21 Update Support',
    description: 'Preparation for the new Minecraft version blocks and mechanics.',
    status: RoadmapStatus.PLANNED,
    category: 'CORE',
    comments: 12,
    priority: 'High'
  },
  {
    id: '2',
    title: 'Global Market Rework',
    description: 'Revamping the auction house UI and tax systems.',
    status: RoadmapStatus.PLANNED,
    category: 'ECONOMY',
    priority: 'Medium'
  },
  {
    id: '3',
    title: 'New Spawn Hub',
    description: 'Cyberpunk themed spawn with interactive NPC zones.',
    status: RoadmapStatus.IN_PROGRESS,
    category: 'BUILD',
    progress: 75,
    dueDate: 'Friday',
    priority: 'High'
  },
  {
    id: '4',
    title: 'Arena Beta Testing',
    description: 'Balancing kits and map borders.',
    status: RoadmapStatus.IN_PROGRESS,
    category: 'PVP',
    progress: 30,
    priority: 'Medium'
  },
  {
    id: '5',
    title: 'Server Migration',
    description: 'Moved to high-performance dedicated nodes.',
    status: RoadmapStatus.COMPLETED,
    category: 'SYSTEM',
    priority: 'High'
  }
];
