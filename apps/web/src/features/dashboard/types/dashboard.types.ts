export type ActivityType = "collecte" | "observation" | "source" | "rapport" | "erreur";

export interface DashboardStat {
  value: number;
  delta: string;
}

export interface DashboardStats {
  sources: DashboardStat;
  collectes: DashboardStat;
  observations: DashboardStat;
  entites: DashboardStat;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  titre: string;
  detail: string;
  at: string;
}

export interface Dashboard {
  stats: DashboardStats;
  collectes: unknown[];
  activite: ActivityItem[];
  points_attention: string[];
}
