export interface Achievement {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  estado: boolean;
  orden: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export interface PaginationMeta {
  firstPage: number;
  lastPage: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface PaginatedAchievements {
  data: Achievement[];
  meta: PaginationMeta;
}

export interface AchievementFormData {
  name: string;
  icon?: string;
  color?: string;
  estado: boolean;
  orden: number;
}
