
export enum RoadmapStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface RoadmapItem {
  id: string;
  title: string;
  description?: string;
  status?: RoadmapStatus;
  category?: string;
  progress?: number;
  comments?: number;
  dueDate?: string;
  // properties from config.json
  type?: string;
  priority?: string;
  column?: string;
}

export interface RoadmapColumn {
  id: string;
  title: string;
  color: string;
}

export interface FeedbackSection {
  enabled: boolean;
  title: string;
  subtitle: string;
  formspreeUrl: string;
  successMessage: string;
}

export interface RoadmapSection {
  enabled: boolean;
  title: string;
  subtitle: string;
  columns: RoadmapColumn[];
  items: RoadmapItem[];
}

export interface InfoBanner {
  id: string;
  enabled: boolean;
  title: string;
  subtitle: string;
  message: string;
  icon: string;
  style: string;
}

export interface UpdateNotice {
  enabled: boolean;
  title: string;
  subtitle: string;
  showBadge: boolean;
  badgeText: string;
  features: string[];
}

export interface CountdownConfig {
  enabled: boolean;
  date: string;
  title: string;
  expiredMessage: string;
}

export interface SiteInfo {
  title: string;
  description: string;
}

export interface Config {
  siteInfo: SiteInfo;
  updateNotice: UpdateNotice;
  countdown: CountdownConfig;
  github: {
    repository: string;
    token?: string;
  };
  infoBanners: InfoBanner[];
  checkIframeServer: boolean;
  feedbackRoadmap: {
    enabled: boolean;
    sections: {
      feedback: FeedbackSection;
      suggestions: FeedbackSection;
      roadmap: RoadmapSection;
    };
  };
  serverMetadata: {
    ip: string;
    modpackVersion: string;
  };
  // Fallback / legacy support (optional)
  serverIp?: string;
  modpackVersion?: string;
  targetDate?: string;
  githubRepo?: string;
}
