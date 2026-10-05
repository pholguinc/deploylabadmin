import type {
  PaginatedCourses,
  Course,
  CreateCourseDto,
  UpdateCourseDto,
} from "../interfaces/course.interface";
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

export async function createCourse(data: CreateCourseDto): Promise<Course> {
  const res = await apiFetch(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function updateCourse(id: string, data: UpdateCourseDto): Promise<Course> {
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

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
  const res = await apiFetch(`${BASE}/modules/${moduleId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}

export interface FinalExamOptionInput {
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface FinalExamQuestionInput {
  id?: string;
  text: string;
  options: FinalExamOptionInput[];
}

export interface FinalExamConfig {
  id?: string;
  courseId: string;
  title: string;
  questions: FinalExamQuestionInput[];
}

export async function getFinalExam(courseId: string): Promise<FinalExamConfig | null> {
  const res = await apiFetch(`${BASE}/${courseId}/final-exam/admin`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function saveFinalExam(
  courseId: string,
  data: { title: string; questions: FinalExamQuestionInput[] }
): Promise<FinalExamConfig> {
  const res = await apiFetch(`${BASE}/${courseId}/final-exam`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function deleteFinalExam(courseId: string): Promise<void> {
  const res = await apiFetch(`${BASE}/${courseId}/final-exam`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}

