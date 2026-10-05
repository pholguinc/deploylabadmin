import { apiFetch } from "@/lib/api-client";

export interface SettingRecord<T = unknown> {
  id: string;
  key: string;
  value: T;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getSetting<T>(key: string): Promise<T | null> {
  try {
    const res = await apiFetch(`/settings/${key}`, {
      cache: "no-store",
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    const json = await res.json();
    const record: SettingRecord<T> = json?.data ?? json;
    return (record?.value !== undefined ? record.value : (record as unknown as T)) ?? null;
  } catch (err) {
    console.error(`Error loading setting "${key}":`, err);
    return null;
  }
}

export async function getAllSettings(): Promise<SettingRecord[]> {
  try {
    const res = await apiFetch("/settings", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    const json = await res.json();
    return json?.data ?? json;
  } catch (err) {
    console.error("Error loading all settings:", err);
    return [];
  }
}

export async function saveSetting<T>(
  key: string,
  value: T,
  description?: string,
): Promise<SettingRecord<T>> {
  const res = await apiFetch(`/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify({ value, description }),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json?.data ?? json;
}
