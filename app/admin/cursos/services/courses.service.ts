import type { PaginatedCourses, Course } from "../interfaces/course.interface";
import { apiFetch } from "@/lib/api-client";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/courses`;

export async function getCourses(
  page = 1,
  limit = 8
): Promise<PaginatedCourses> {
  const res = await apiFetch(`${BASE}/list?page=${page}&limit=${limit}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const payload: PaginatedCourses =
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

export async function createCourse(data: Partial<Course>): Promise<Course> {
  const res = await apiFetch(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<Course> {
  const res = await apiFetch(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function uploadCourseImage(courseId: string, file: File): Promise<Course> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await apiFetch(`${BASE}/${courseId}/image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function getCourseById(id: string): Promise<Course> {
  const res = await apiFetch(`${BASE}/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function deleteCourse(id: string): Promise<void> {
  const res = await apiFetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}

export async function createModule(courseId: string, data: { title: string; order?: number }) {
  const res = await apiFetch(`${BASE}/${courseId}/modules`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function updateModule(courseId: string, moduleId: string, data: { title?: string; order?: number }) {
  const res = await apiFetch(`${BASE}/modules/${moduleId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}
