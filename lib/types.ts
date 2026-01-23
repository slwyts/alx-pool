export interface StakeRecord {
  id: number;
  amount: number;
  totalReturn: number;
  nextReleaseDate: string;
  progress: number;
  daysLeft: number;
  type: 'User' | 'Admin';
}

export interface NewsItem {
  id: number;
  title: string;
  title_en: string;
  date: string;
  desc: string;
}

export interface Config {
  bonusRate: number;
  lockDays: number;
  initialRate: number;
  linearDays: number;
}

export interface MyAssets {
  locked: string;
  claimable: string;
}

export interface AdminForm {
  targetAddr: string;
  amount: string;
}

export type TabType = 'stake' | 'news' | 'mine' | 'admin';
