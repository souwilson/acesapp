import { Platform, Tool, Collaborator, AdPerformance } from '@/types/dashboard';

export const mockPlatforms: Platform[] = [
  { id: '1', name: 'Stripe', type: 'gateway', balance: 45320.50, currency: 'USD', lastUpdated: '2026-01-22', notes: 'Principal gateway' },
  { id: '2', name: 'PayPal', type: 'gateway', balance: 12500.00, currency: 'USD', lastUpdated: '2026-01-21' },
  { id: '3', name: 'Binance', type: 'exchange', balance: 28750.00, currency: 'USDT', lastUpdated: '2026-01-22' },
  { id: '4', name: 'Banco do Brasil', type: 'bank', balance: 156780.00, currency: 'BRL', lastUpdated: '2026-01-22' },
  { id: '5', name: 'Hotmart', type: 'digital', balance: 34200.00, currency: 'BRL', lastUpdated: '2026-01-20' },
  { id: '6', name: 'Nubank', type: 'bank', balance: 89450.00, currency: 'BRL', lastUpdated: '2026-01-22' },
];

export const mockTools: Tool[] = [
  { id: '1', name: 'Meta Ads', category: 'ads', monthlyValue: 5000, currency: 'USD', dueDate: '2026-01-25', status: 'active', paymentMethod: 'Cartão' },
  { id: '2', name: 'Google Ads', category: 'ads', monthlyValue: 3500, currency: 'USD', dueDate: '2026-01-28', status: 'active', paymentMethod: 'Cartão' },
  { id: '3', name: 'AWS', category: 'infra', monthlyValue: 1200, currency: 'USD', dueDate: '2026-02-01', status: 'active', paymentMethod: 'Fatura' },
  { id: '4', name: 'Figma', category: 'design', monthlyValue: 75, currency: 'USD', dueDate: '2026-01-30', status: 'active', paymentMethod: 'Cartão' },
  { id: '5', name: 'OpenAI', category: 'ai', monthlyValue: 500, currency: 'USD', dueDate: '2026-02-05', status: 'active', paymentMethod: 'Cartão' },
  { id: '6', name: 'HubSpot', category: 'crm', monthlyValue: 890, currency: 'USD', dueDate: '2026-01-24', status: 'active', paymentMethod: 'Fatura', notes: 'Vencimento próximo!' },
  { id: '7', name: 'Vercel', category: 'infra', monthlyValue: 40, currency: 'USD', dueDate: '2026-02-10', status: 'active', paymentMethod: 'Cartão' },
  { id: '8', name: 'Slack', category: 'other', monthlyValue: 120, currency: 'USD', dueDate: '2026-02-15', status: 'active', paymentMethod: 'Cartão' },
];

export const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'João Silva', type: 'pj', role: 'Desenvolvedor Full Stack', monthlyValue: 12000, paymentDate: '2026-01-05', status: 'active' },
  { id: '2', name: 'Maria Santos', type: 'freelancer', role: 'Designer UI/UX', monthlyValue: 6500, paymentDate: '2026-01-10', status: 'active' },
  { id: '3', name: 'Pedro Costa', type: 'fixed', role: 'Gestor de Tráfego', monthlyValue: 8000, paymentDate: '2026-01-05', status: 'active' },
  { id: '4', name: 'Ana Oliveira', type: 'freelancer', role: 'Copywriter', monthlyValue: 4500, paymentDate: '2026-01-15', status: 'active' },
  { id: '5', name: 'Carlos Mendes', type: 'pj', role: 'Editor de Vídeo', monthlyValue: 5000, paymentDate: '2026-01-10', status: 'paused', notes: 'Projeto pausado' },
];

export const mockAdPerformance: AdPerformance[] = [
  { id: '1', platform: 'meta', date: '2026-01-22', investment: 1500, revenue: 6200, sales: 42, roas: 4.13, cpa: 35.71 },
  { id: '2', platform: 'meta', date: '2026-01-21', investment: 1400, revenue: 5800, sales: 38, roas: 4.14, cpa: 36.84 },
  { id: '3', platform: 'meta', date: '2026-01-20', investment: 1600, revenue: 7100, sales: 48, roas: 4.44, cpa: 33.33 },
  { id: '4', platform: 'google', date: '2026-01-22', investment: 800, revenue: 2900, sales: 19, roas: 3.63, cpa: 42.11 },
  { id: '5', platform: 'google', date: '2026-01-21', investment: 750, revenue: 2600, sales: 17, roas: 3.47, cpa: 44.12 },
  { id: '6', platform: 'google', date: '2026-01-20', investment: 900, revenue: 3200, sales: 21, roas: 3.56, cpa: 42.86 },
  { id: '7', platform: 'tiktok', date: '2026-01-22', investment: 500, revenue: 1800, sales: 15, roas: 3.60, cpa: 33.33 },
  { id: '8', platform: 'tiktok', date: '2026-01-21', investment: 450, revenue: 1500, sales: 12, roas: 3.33, cpa: 37.50 },
  { id: '9', platform: 'twitter', date: '2026-01-22', investment: 300, revenue: 800, sales: 6, roas: 2.67, cpa: 50.00 },
];

export const cashFlowData = [
  { date: '01/01', balance: 280000, revenue: 45000, expenses: 32000 },
  { date: '05/01', balance: 295000, revenue: 52000, expenses: 37000 },
  { date: '10/01', balance: 310000, revenue: 48000, expenses: 33000 },
  { date: '15/01', balance: 328000, revenue: 56000, expenses: 38000 },
  { date: '20/01', balance: 345000, revenue: 61000, expenses: 44000 },
  { date: '22/01', balance: 367000, revenue: 58000, expenses: 36000 },
];

export const monthlyRevenueVsExpenses = [
  { month: 'Ago', revenue: 185000, expenses: 142000 },
  { month: 'Set', revenue: 210000, expenses: 155000 },
  { month: 'Out', revenue: 198000, expenses: 148000 },
  { month: 'Nov', revenue: 245000, expenses: 168000 },
  { month: 'Dez', revenue: 278000, expenses: 185000 },
  { month: 'Jan', revenue: 320000, expenses: 220000 },
];
