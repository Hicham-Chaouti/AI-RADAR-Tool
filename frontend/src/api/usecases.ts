import client from './client'
import type { UseCase } from '../types/useCase'
import type { Roadmap } from '../types/roadmap'

export async function getUseCase(id: string): Promise<UseCase> {
    const response = await client.get<UseCase>(`/usecases/${id}`)
    return response.data
}

export async function generateRoadmap(id: string, sessionId?: string): Promise<Roadmap> {
    const response = await client.post<Roadmap>(`/usecases/${id}/roadmap`, {
        session_id: sessionId ?? null,
    })
    return response.data
}
