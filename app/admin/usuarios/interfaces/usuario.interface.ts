export interface RoleDto {
  id: string;
  name: string;
}

export interface Usuario {
  id: string;
  email: string;
  name?: string | null;
  isActive: boolean;
  roles?: RoleDto[];
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
  email: string;
  roles: string[]; // Role IDs
  isActive: boolean;
  password?: string;
}
