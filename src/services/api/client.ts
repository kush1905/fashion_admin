const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await response.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string } }
    | null;
  if (!json || json.success === false) {
    throw new ApiError(response.status, json?.error.code ?? "API_ERROR", json?.error.message ?? "Request failed");
  }
  return json.data;
}

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body,
    cache: "no-store",
  });
  const json = (await response.json().catch(() => null)) as
    | { success: true; data: { url: string; path?: string } }
    | { success: false; error: { code: string; message: string } }
    | null;
  if (!json || json.success === false) {
    throw new ApiError(response.status, json?.error.code ?? "UPLOAD_ERROR", json?.error.message ?? "Upload failed");
  }
  // Prefer portable relative path for catalogue storage.
  return json.data.path || json.data.url;
}
