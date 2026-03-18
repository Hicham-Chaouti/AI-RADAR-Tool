import client from './client'
import type { UseCase } from '../types/useCase'

export async function getUseCase(id: string): Promise<UseCase> {
    const response = await client.get<UseCase>(`/usecases/${id}`)
    return response.data
}
