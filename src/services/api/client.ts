import type { ApiConfig, ApiError } from './types'
import type { ApiResponse, PaginatedResponse } from '@/types/api'

export class ApiClient {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = config
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...options.headers,
    }

    try {
      console.log(`[API] Base URL: ${this.config.baseURL}`)
      console.log(`[API] Endpoint: ${endpoint}`)
      console.log(`[API] Full URL: ${url}`)
      if (options.body) {
        try {
          const parsedBody = JSON.parse(options.body as string)
          console.log(`[API] ${options.method || 'GET'} ${url}`, parsedBody)
        } catch (e) {
          console.log(`[API] ${options.method || 'GET'} ${url}`, options.body)
        }
      }
      
      let response: Response
      try {
        response = await fetch(url, {
          ...options,
          headers,
          signal: AbortSignal.timeout(this.config.timeout || 30000),
        })
      } catch (fetchError) {
        console.error('[API] Fetch error:', fetchError)
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            throw { message: 'Request timeout', status: 408 } as ApiError
          }
          if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('NetworkError') || fetchError.message.includes('CORS')) {
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown'
            const isCorsError = fetchError.message.includes('CORS') || 
                               (typeof window !== 'undefined' && window.location.protocol === 'https:')
            
            let errorMessage: string
            if (isCorsError) {
              errorMessage = `CORS Error: The backend server at https://kolla-cdb6b0d315ac.herokuapp.com is not configured to allow requests from ${currentOrigin}. ` +
                           `Please configure the backend CORS settings to allow requests from this origin. ` +
                           `The backend needs to include '${currentOrigin}' in its Access-Control-Allow-Origin header.`
            } else {
              errorMessage = 'Network error: Unable to connect to server. Please check your internet connection and ensure the backend is running at https://kolla-cdb6b0d315ac.herokuapp.com'
            }
            throw { message: errorMessage, status: 0 } as ApiError
          }
        }
        throw { message: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`, status: 0 } as ApiError
      }

      // Read response text once (can only be read once)
      let text: string
      try {
        text = await response.text()
      } catch (readError) {
        console.error('[API] Error reading response body:', readError)
        // This might be a CORS error when trying to read the response
        if (readError instanceof TypeError && (readError.message.includes('Failed to fetch') || readError.message.includes('network'))) {
          throw { 
            message: 'CORS error: Unable to read response. The backend server needs to allow requests from this origin (http://localhost:5174). Please configure CORS headers on the backend.', 
            status: 0 
          } as ApiError
        }
        throw { 
          message: `Error reading response: ${readError instanceof Error ? readError.message : 'Unknown error'}`, 
          status: response.status 
        } as ApiError
      }
      
      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        }

        if (text) {
          try {
            const errorData = JSON.parse(text)
            error.errors = errorData.errors
            error.message = errorData.message || error.message
            console.error('[API] Error response:', errorData)
          } catch {
            // Not JSON, use text as error message
            error.message = text
            console.error('[API] Error:', response.status, response.statusText, text)
          }
        } else {
          console.error('[API] Error:', response.status, response.statusText)
        }

        throw error
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return undefined as T
      }
      
      // Handle empty text response
      if (!text || text.trim() === '') {
        // Empty response
        if (response.status === 201) {
          // 201 Created might return empty body, check Location header
          const location = response.headers.get('location')
          if (location) {
            const guid = location.split('/').pop()
            console.log('[API] Response (from Location header):', guid)
            return (guid || '') as T
          }
        }
        return undefined as T
      }
      
      // Try to parse as JSON
      try {
        const data = JSON.parse(text)
        console.log('[API] Response (JSON):', data)
        
        // Handle case where backend returns GUID wrapped in quotes (JSON string)
        if (typeof data === 'string') {
          return data as T
        }
        
        return data
      } catch {
        // Not JSON, return as text (for GUID responses - plain text)
        // Remove quotes if present
        const cleanText = text.trim().replace(/^["']|["']$/g, '')
        console.log('[API] Response (text/GUID):', cleanText)
        return cleanText as T
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw { message: 'Request timeout', status: 408 } as ApiError
      }
      console.error('[API] Request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}






