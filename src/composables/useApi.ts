/**
 * Dependency Injection for API Services
 * Allows mocking in tests and flexible service configuration
 */

import { inject, provide, type InjectionKey } from 'vue'
import type { ApiServices } from '@/services/api'
import { defaultApiServices } from '@/services/api'

export const ApiServicesKey: InjectionKey<ApiServices> = Symbol('api-services')

export function provideApi(services: ApiServices): void {
  provide(ApiServicesKey, services)
}

export function useApi(): ApiServices {
  const services = inject(ApiServicesKey, defaultApiServices)
  return services
}

// Re-export for convenience
export { defaultApiServices }

