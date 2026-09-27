import type {
  PaginatedAchievements,
  Achievement,
  AchievementFormData,
} from "../interfaces/achievement.interface";
import { apiFetch } from "@/lib/api-client";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/achievements`;

export async function getAchievements(
  page = 1,
  limit = 10
): Promise<PaginatedAchievements> {
  const res = await apiFetch(`${BASE}/list?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();

  // El ResponseInterceptor de NestJS envuelve la respuesta como:
  // { data: { data: [...], meta: {...} }, statusCode, message }
  // Si no hay wrapper, la respuesta ya es el payload directo.
  const payload: PaginatedAchievements =
    json?.data?.data !== undefined ? json.data : json;

  // Garantizar que data siempre sea un array
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

export async function createAchievement(
  data: AchievementFormData
): Promise<Achievement> {
  const res = await apiFetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function updateAchievement(
  id: string,
  data: Partial<AchievementFormData>
): Promise<Achievement> {
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function deleteAchievement(id: string): Promise<void> {
  const res = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}
