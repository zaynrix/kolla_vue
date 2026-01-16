import type { ApiClient } from './client'
import type {
  ActorDto,
  CreateActorRequest,
  UpdateActorRoleRequest,
} from '@/types/api'

export class ActorApiService {
  constructor(private apiClient: ApiClient) {}

  async getAllActors(): Promise<string[]> {
    return await this.apiClient.get<string[]>('/Actor/GetAll')
  }

  async getActor(guid: string): Promise<ActorDto> {
    return await this.apiClient.get<ActorDto>(`/Actor/Get/${guid}`)
  }

  async createActor(request: CreateActorRequest): Promise<string> {
    // POST Create(string DisplayName, string? RoleGuid): Guid
    const requestBody: any = {
      DisplayName: request.DisplayName,
    }
    
    if (request.RoleGuid !== undefined && request.RoleGuid !== null && request.RoleGuid !== '') {
      requestBody.RoleGuid = request.RoleGuid
    }
    
    try {
      const response = await this.apiClient.post<string | { Guid?: string; guid?: string }>('/Actor/Create', requestBody)
      
      // Extract GUID from response - backend returns Guid string
      let actorGuid: string
      
      if (typeof response === 'string') {
        // Response is a GUID string
        actorGuid = response.trim().replace(/^["']|["']$/g, '')
      } else if (response && typeof response === 'object') {
        // Response might be an object with Guid or guid property
        actorGuid = (response.Guid || response.guid || '') as string
      } else {
        throw new Error('Unexpected response format from Actor/Create')
      }
      
      if (!actorGuid || actorGuid === 'undefined' || actorGuid === 'null' || actorGuid === '') {
        throw new Error('Failed to get actor GUID from response')
      }
      
      console.log('[ActorApi] Created actor with GUID:', actorGuid)
      return actorGuid
    } catch (createError) {
      console.error('[ActorApi] Error creating actor:', createError)
      throw new Error(`Failed to create actor: ${createError instanceof Error ? createError.message : 'Unknown error'}`)
    }
  }

  async setActorDisplayName(actorGuid: string, displayName: string): Promise<void> {
    await this.apiClient.patch<void>(`/Actor/SetDisplayName`, {
      Guid: actorGuid,
      DisplayName: displayName,
    })
  }

  async setActorRole(actorGuid: string, roleGuid?: string | null): Promise<void> {
    await this.apiClient.patch<void>(`/Actor/SetRole`, {
      Guid: actorGuid,
      RoleGuid: roleGuid ?? null,
    })
  }

  async getAllAssignments(actorGuid: string): Promise<string[]> {
    return await this.apiClient.get<string[]>(`/Actor/GetAllAssignments/${actorGuid}`)
  }

  async deleteActor(guid: string): Promise<void> {
    await this.apiClient.delete<void>(`/Actor/Delete/${guid}`)
  }
}






