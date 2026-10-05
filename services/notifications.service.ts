import { apiFetch } from "@/lib/api-client";

export interface NotificationItem {
  id: string;
  userId: string | null;
  type: string;
  title: string;
  message: string;
  data: {
    userId?: string;
    studentName?: string;
    studentEmail?: string;
    courseId?: string;
    courseTitle?: string;
    score?: number;
    certificateId?: string;
    completedAt?: string;
    [key: string]: any;
  } | null;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
}

export async function getNotifications(params?: {
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse> {
  const query = new URLSearchParams();
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.unreadOnly) query.append("unreadOnly", "true");

  const qs = query.toString();
  const endpoint = qs ? `/notifications?${qs}` : "/notifications";

  const res = await apiFetch(endpoint, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error fetching notifications: ${res.status}`);
  }

  const json = await res.json();
  return json.data || json;
}

export async function getNotificationById(id: string): Promise<NotificationItem> {
  const res = await apiFetch(`/notifications/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error fetching notification ${id}: ${res.status}`);
  }

  const json = await res.json();
  return json.data || json;
}

export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  const res = await apiFetch(`/notifications/${id}/read`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error(`Error marking notification as read: ${res.status}`);
  }

  const json = await res.json();
  return json.data || json;
}

export async function markAllNotificationsAsRead(): Promise<{ updatedCount: number }> {
  const res = await apiFetch("/notifications/read-all", {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error(`Error marking all as read: ${res.status}`);
  }

  const json = await res.json();
  return json.data || json;
}

export async function triggerTestCourseCompletedWebhook(): Promise<any> {
  const res = await apiFetch("/webhooks/course-completed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: "course.completed",
      courseId: "demo-course-id",
      userId: "demo-student-id",
      studentName: "Carlos Gómez (App Móvil)",
      studentEmail: "carlos.gomez@ejemplo.com",
      courseTitle: "Despliegue Continuo con Docker y Kubernetes",
      score: 18.5,
      completedAt: new Date().toISOString(),
      metadata: {
        device: "React Native Mobile (iOS)",
        source: "Final Exam Simulator",
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Error triggering webhook: ${res.status}`);
  }

  const json = await res.json();
  return json.data || json;
}
