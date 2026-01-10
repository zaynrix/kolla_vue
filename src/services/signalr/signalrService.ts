import * as signalR from '@microsoft/signalr'
import { useWorkStepStore } from '@/stores/workStep'
import { defaultApiServices } from '@/services/api/index'
import type { WorkStep } from '@/types/domain'
import { mapAssignmentToWorkStep } from '@/services/api/mappers'
import type { AssignmentDto } from '@/types/api'
import { Role } from '@/types/domain'

export class SignalRService {
  private connection: signalR.HubConnection | null = null
  private isConnecting = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000 // 3 seconds

  private getBaseUrl(): string {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://kolla-cdb6b0d315ac.herokuapp.com'
    return baseURL.replace(/\/$/, '')
  }
  async start(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      console.log('[SignalR] Already connected')
      return
    }

    if (this.isConnecting) {
      console.log('[SignalR] Connection already in progress')
      return
    }

    this.isConnecting = true

    try {
      const baseURL = this.getBaseUrl()
      const hubUrl = `${baseURL}/Assignment/Notify`

      console.log('[SignalR] Connecting to:', hubUrl)

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount === 0) return 0
            if (retryContext.previousRetryCount === 1) return 2000
            if (retryContext.previousRetryCount === 2) return 10000
            return 30000
          },
        })
        .configureLogging(signalR.LogLevel.Information)
        .build()

      this.registerHandlers()
      await this.connection.start()
      console.log('[SignalR] Connected successfully - real-time updates enabled')
      console.log('[SignalR] Connection state:', this.connection.state)
      console.log('[SignalR] Connection ID:', this.connection.connectionId)

      this.reconnectAttempts = 0
      this.isConnecting = false

      this.connection.onclose((error) => {
        console.log('[SignalR] Connection closed', error)
        this.isConnecting = false
        if (error) {
          console.error('[SignalR] Connection closed with error:', error)
          this.attemptReconnect()
        }
      })

      this.connection.onreconnecting((error) => {
        console.log('[SignalR] Reconnecting...', error)
      })

      this.connection.onreconnected((connectionId) => {
        console.log('[SignalR] Reconnected with connection ID:', connectionId)
        this.reconnectAttempts = 0
      })
    } catch (error) {
      console.error('[SignalR] Failed to start connection:', error)
      this.isConnecting = false
      this.attemptReconnect()
      throw error
    }
  }

  private registerHandlers(): void {
    if (!this.connection) return

    this.connection.on('OnAssignmentUpdated', async (assignmentId: string) => {
      console.log('[SignalR] OnAssignmentUpdated received for assignment:', assignmentId)
      await this.handleAssignmentUpdated(assignmentId)
    })
  }

  private async handleAssignmentUpdated(assignmentId: string): Promise<void> {
    try {
      console.log('[SignalR] Real-time update received for assignment:', assignmentId)
      console.log('[SignalR] This will update all open views automatically via Vue reactivity')

      const workStepStore = useWorkStepStore()
      const existingWorkStep = workStepStore.getWorkStepById(assignmentId)

      if (existingWorkStep) {
        console.log('[SignalR] Fetching updated work step from API...')
        const updatedWorkStep = await defaultApiServices.workStep.getWorkStepById(assignmentId)
        
        const workStepWithContext: WorkStep = {
          ...updatedWorkStep,
          workflowId: existingWorkStep.workflowId,
          sequenceNumber: existingWorkStep.sequenceNumber,
        }
        
        console.log('[SignalR] Updating store with new work step data...')
        workStepStore.updateWorkStep(workStepWithContext)
        console.log('[SignalR] Store updated successfully - all views should update automatically')
      } else {
        try {
          const updatedWorkStep = await defaultApiServices.workStep.getWorkStepById(assignmentId)
          workStepStore.addWorkStep(updatedWorkStep)
          console.log('[SignalR] Added new work step to store:', assignmentId)
        } catch (error) {
          console.warn('[SignalR] Failed to fetch single work step, reloading all:', error)
          const allWorkSteps = await defaultApiServices.workStep.getAllWorkSteps()
          workStepStore.setWorkSteps(allWorkSteps)
          console.log('[SignalR] Reloaded all work steps')
        }
      }
    } catch (error) {
      console.error('[SignalR] Error handling assignment update:', error)
      try {
        const workStepStore = useWorkStepStore()
        const allWorkSteps = await defaultApiServices.workStep.getAllWorkSteps()
        workStepStore.setWorkSteps(allWorkSteps)
        console.log('[SignalR] Reloaded all work steps as fallback')
      } catch (reloadError) {
        console.error('[SignalR] Failed to reload work steps:', reloadError)
      }
    }
  }
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SignalR] Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`[SignalR] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    setTimeout(async () => {
      try {
        await this.start()
      } catch (error) {
        console.error('[SignalR] Reconnect attempt failed:', error)
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect()
        }
      }
    }, this.reconnectDelay)
  }

  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop()
        console.log('[SignalR] Connection stopped')
      } catch (error) {
        console.error('[SignalR] Error stopping connection:', error)
      } finally {
        this.connection = null
        this.isConnecting = false
      }
    }
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null
  }
}

let signalRServiceInstance: SignalRService | null = null

export function getSignalRService(): SignalRService {
  if (!signalRServiceInstance) {
    signalRServiceInstance = new SignalRService()
  }
  return signalRServiceInstance
}

