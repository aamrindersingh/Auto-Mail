const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== "undefined") window.location.href = "/auth/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.detail || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  // Auth
  async register(email: string, password: string, name?: string) {
    return this.request<{ access_token: string; user_id: string; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ access_token: string; user_id: string; email: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // OAuth
  async getOAuthStart() {
    return this.request<{ redirect_url: string }>("/auth/google/start");
  }

  async getOAuthStatus() {
    return this.request<{
      connected: boolean;
      gmail_address: string | null;
      token_status: string | null;
      connected_at: string | null;
      last_successful_send_at: string | null;
      last_error: string | null;
    }>("/auth/google/status");
  }

  async disconnectGoogle() {
    return this.request<{ status: string; jobs_paused: number }>("/auth/google/disconnect", { method: "POST" });
  }

  async reconnectGoogle() {
    return this.request<{ redirect_url: string }>("/auth/google/reconnect", { method: "POST" });
  }

  // Jobs
  async createJob(data: {
    job_type: string;
    recipients: { to: string[]; cc?: string[]; bcc?: string[] };
    subject: string;
    body_text?: string;
    body_html?: string;
    schedule_time?: string;
    timezone?: string;
    recurrence?: string;
    interval_minutes?: number;
  }) {
    return this.request<JobResponse>("/jobs", { method: "POST", body: JSON.stringify(data) });
  }

  async listJobs(params?: { status?: string; job_type?: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.job_type) query.set("job_type", params.job_type);
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));
    const qs = query.toString();
    return this.request<{ jobs: JobResponse[]; pagination: Pagination }>(`/jobs${qs ? `?${qs}` : ""}`);
  }

  async getJob(jobId: string) {
    return this.request<JobResponse>(`/jobs/${jobId}`);
  }

  async cancelJob(jobId: string) {
    return this.request<{ job_id: string; status: string }>(`/jobs/${jobId}/cancel`, { method: "POST" });
  }

  async pauseJob(jobId: string) {
    return this.request<{ job_id: string; status: string }>(`/jobs/${jobId}/pause`, { method: "POST" });
  }

  async resumeJob(jobId: string) {
    return this.request<{ job_id: string; status: string }>(`/jobs/${jobId}/resume`, { method: "POST" });
  }

  async getJobRuns(jobId: string, page = 1) {
    return this.request<{ runs: RunResponse[]; pagination: Pagination }>(`/jobs/${jobId}/runs?page=${page}`);
  }
}

export interface JobResponse {
  job_id: string;
  job_type: string;
  subject: string;
  recipients: { to: string[]; cc?: string[]; bcc?: string[] };
  status: string;
  schedule_time_utc: string | null;
  schedule_timezone: string | null;
  recurrence: string | null;
  interval_minutes: number | null;
  total_runs: number;
  successful_runs: number;
  failed_runs: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RunResponse {
  run_id: string;
  scheduled_for_utc: string;
  started_at: string | null;
  finished_at: string | null;
  status: string;
  provider_message_id: string | null;
  error_code: string | null;
  error_detail: string | null;
  attempt_count: number;
  created_at: string;
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages?: number;
}

export const api = new ApiClient();
