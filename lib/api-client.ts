"use client";

import { getAccessToken } from "@/lib/auth";

interface APIClientConfig {
  baseURL: string;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "APIError";
  }
}

class APIClient {
  private baseURL: string;

  constructor(config: APIClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ""); // Remove trailing slash
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;

    // Get auth token if not skipping auth
    let headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    };

    if (!skipAuth) {
      const token = await getAccessToken();
      if (token) {
        headers = {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401 && !skipAuth) {
        // Redirect to login - handled by middleware or caller
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new APIError(401, "Unauthorized", { message: "Please sign in" });
      }

      // Handle other errors
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        throw new APIError(
          response.status,
          response.statusText,
          errorData
        );
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return null as T;
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new Error(`Network error: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

// Create and export a singleton instance
export const api = new APIClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// Export the class for custom instances if needed
export { APIClient, APIError };

