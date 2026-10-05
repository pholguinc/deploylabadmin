import { apiFetch } from "@/lib/api-client";
import type {
  ReportSummary,
  CourseReportItem,
  ExamReportItem,
  CertificateReportItem,
  StudentProgressReportItem,
} from "../interfaces/reports.interface";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/reports`;

export async function getReportSummary(): Promise<ReportSummary> {
  const res = await apiFetch(`${BASE}/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json?.data ?? json;
}

export async function getCoursesReport(): Promise<CourseReportItem[]> {
  const res = await apiFetch(`${BASE}/courses`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const payload = json?.data ?? json;
  return Array.isArray(payload) ? payload : [];
}

export async function getExamsReport(): Promise<ExamReportItem[]> {
  const res = await apiFetch(`${BASE}/exams`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const payload = json?.data ?? json;
  return Array.isArray(payload) ? payload : [];
}

export async function getCertificatesReport(): Promise<CertificateReportItem[]> {
  const res = await apiFetch(`${BASE}/certificates`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const payload = json?.data ?? json;
  return Array.isArray(payload) ? payload : [];
}

export async function getStudentsProgressReport(): Promise<StudentProgressReportItem[]> {
  const res = await apiFetch(`${BASE}/students-progress`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const payload = json?.data ?? json;
  return Array.isArray(payload) ? payload : [];
}
