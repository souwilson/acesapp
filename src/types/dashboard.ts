// Dashboard Types

export interface Platform {
  id: string;
  name: string;
  type: 'bank' | 'gateway' | 'exchange' | 'digital';
  balance: number;
  currency: string;
  notes?: string;
  lastUpdated: string;
}

export interface Tool {
  id: string;
  name: string;
  category: 'ads' | 'infra' | 'design' | 'ai' | 'crm' | 'other';
  monthlyValue: number;
  currency: string;
  dueDate: string;
  status: 'active' | 'cancelled';
  paymentMethod: string;
  notes?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  type: 'freelancer' | 'pj' | 'fixed';
  role: string;
  monthlyValue: number;
  paymentDate: string;
  status: 'active' | 'paused' | 'ended';
  notes?: string;
}

export interface AdPerformance {
  id: string;
  platform: 'meta' | 'google' | 'twitter' | 'tiktok' | 'other';
  date: string;
  investment: number;
  revenue: number;
  sales: number;
  roas: number;
  cpa?: number;
}

export type CategoryColors = {
  [key: string]: string;
};

export const platformTypeLabels: Record<Platform['type'], string> = {
  bank: 'Banco',
  gateway: 'Gateway',
  exchange: 'Exchange',
  digital: 'Plataforma Digital',
};

export const toolCategoryLabels: Record<Tool['category'], string> = {
  ads: 'Ads',
  infra: 'Infra',
  design: 'Design',
  ai: 'IA',
  crm: 'CRM',
  other: 'Outros',
};

export const collaboratorTypeLabels: Record<Collaborator['type'], string> = {
  freelancer: 'Freelancer',
  pj: 'PJ',
  fixed: 'Fixo',
};

export const adPlatformLabels: Record<AdPerformance['platform'], string> = {
  meta: 'Meta Ads',
  google: 'Google Ads',
  twitter: 'Twitter/X',
  tiktok: 'TikTok Ads',
  other: 'Outros',
};
