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
    const requestBody: any = {
      DisplayName: request.DisplayName,
    }
    
    if (request.RoleGuid !== undefined && request.RoleGuid !== null && request.RoleGuid !== '') {
      requestBody.RoleGuid = request.RoleGuid
    }
    
    const response = await this.apiClient.post<string>('/Actor/Create', requestBody)
    return response
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






