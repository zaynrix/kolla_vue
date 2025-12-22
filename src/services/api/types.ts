/**
 * API Service Types
 */

export interface ApiConfig {
  baseURL: string
  timeout?: number
  headers?: Record<string, string>
}

export interface ApiError {
  message: string
  status?: number
  errors?: string[]
}



