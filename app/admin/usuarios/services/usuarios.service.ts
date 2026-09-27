import type {
  PaginatedUsuarios,
  Usuario,
  UsuarioFormData,
} from "../interfaces/usuario.interface";
import { apiFetch } from "@/lib/api-client";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/users`;

export async function getUsers(
  page = 1,
  limit = 10
): Promise<PaginatedUsuarios> {
  const res = await apiFetch(`${BASE}/list?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();

  const payload: PaginatedUsuarios =
    json?.data?.data !== undefined ? json.data : json;

  return {
    data: Array.isArray(payload?.data) ? payload.data : [],
    meta: payload?.meta ?? {
      firstPage: 1,
      lastPage: 1,
      currentPage: page,
      totalPages: 1,
      totalItems: 0,
    },
  };
}

export async function createUser(data: UsuarioFormData): Promise<Usuario> {
  const res = await apiFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function updateUser(
  id: string,
  data: Partial<UsuarioFormData>
): Promise<Usuario> {
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function updateUserStatus(
  id: string,
  isActive: boolean
): Promise<Usuario> {
  const res = await apiFetch(`${BASE}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}
