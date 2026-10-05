export interface RoleDto {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Usuario {
  id: string;
  email: string;
  name?: string | null;
  lastname?: string | null;
  phone?: string | null;
  isActive: boolean;
  role?: RoleDto | string | null;
  roles?: RoleDto[];
  roleId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  firstPage: number;
  lastPage: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface PaginatedUsuarios {
  data: Usuario[];
  meta: PaginationMeta;
}

export interface UsuarioFormData {
  name: string;
  lastname: string;
  phone?: string;
  email: string;
  roles: string[]; // Role IDs
  isActive: boolean;
  password?: string;
}
