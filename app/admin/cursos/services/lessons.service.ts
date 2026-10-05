import { apiFetch, uploadFileWithProgress } from "@/lib/api-client";
import { Lesson, Question } from "../interfaces/course.interface";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/lessons`;

export async function createLesson(data: {
  title: string;
  moduleId: string;
  type?: string;
  duration?: string;
  videoUrl?: string;
  order?: number;
}): Promise<Lesson> {
  const res = await apiFetch(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function updateLesson(lessonId: string, data: { videoUrl?: string; title?: string; duration?: string; type?: string; order?: number }): Promise<Lesson> {
  const res = await apiFetch(`${BASE}/${lessonId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function uploadLessonVideo(lessonId: string, file: File, onProgress?: (progress: number) => void) {
  const formData = new FormData();
  formData.append("video", file);

  const json = await uploadFileWithProgress(`${BASE}/${lessonId}/video`, formData, onProgress || (() => {}));
  return json?.data ?? json;
}

// --- RESOURCES ---

export async function createResource(lessonId: string, data: { name: string; type?: string; size?: string; file?: File; url?: string }) {
  const formData = new FormData();
  formData.append("name", data.name);
  if (data.type) formData.append("type", data.type);
  if (data.size) formData.append("size", data.size);
  if (data.file) formData.append("file", data.file);
  if (data.url) formData.append("url", data.url);

  const res = await apiFetch(`${BASE}/${lessonId}/resources`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function deleteResource(resourceId: string): Promise<void> {
  const res = await apiFetch(`${BASE}/resources/${resourceId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}

export async function replaceResourceFile(resourceId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`${BASE}/resources/${resourceId}/file`, {
    method: "PATCH",
    body: formData,
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

// --- QUIZZES ---

interface CreateQuizPayload {
  title: string;
  questions?: {
    text: string;
    options: { text: string; isCorrect?: boolean }[];
  }[];
}

export async function createQuiz(lessonId: string, data: CreateQuizPayload) {
  const res = await apiFetch(`${BASE}/${lessonId}/quizzes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function deleteQuiz(quizId: string): Promise<void> {
  const res = await apiFetch(`${BASE}/quizzes/${quizId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}

// --- QUESTIONS ---

export async function addQuestion(quizId: string, data: { text: string; options: { text: string; isCorrect?: boolean }[] }) {
  const res = await apiFetch(`${BASE}/quizzes/${quizId}/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return json?.data ?? json;
}

export async function updateQuestion(questionId: string, data: { text: string }) {
  const res = await apiFetch(`${BASE}/quizzes/questions/${questionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const res = await apiFetch(`${BASE}/quizzes/questions/${questionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
}

// --- OPTIONS ---

export async function updateOption(optionId: string, data: { text?: string; isCorrect?: boolean }) {
  const res = await apiFetch(`${BASE}/quizzes/options/${optionId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  return res.json();
}
