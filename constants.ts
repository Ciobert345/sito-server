
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
    title: 'Kernel 4.2 Migration',
    description: 'Upgrading core network stack to support 10Gbps egress traffic.',
    status: RoadmapStatus.IN_PROGRESS,
    category: 'INFRA',
    priority: 'Critical'
  },
  {
    id: '2',
    title: 'DDoS Mitigation v3',
    description: 'Implementing custom BGP filters for advanced L7 protection.',
    status: RoadmapStatus.PLANNED,
    category: 'SECURITY',
    priority: 'High'
  },
  {
    id: '3',
    title: 'Player-Sync Protocol',
    description: 'Low-latency state replication between US and EU nodes.',
    status: RoadmapStatus.IN_PROGRESS,
    category: 'CORE',
    priority: 'Medium'
  },
  {
    id: '4',
    title: 'AI Log Analysis',
    description: 'Automated threat detection and anomaly reporting.',
    status: RoadmapStatus.PLANNED,
    category: 'SYSTEM',
    priority: 'Low'
  },
  {
    id: '5',
    title: 'Storage Array Rework',
    description: 'Zero-downtime migration to NVMe Gen5 storage clusters.',
    status: RoadmapStatus.COMPLETED,
    category: 'STORAGE',
    priority: 'High'
  }
];
