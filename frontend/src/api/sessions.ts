import client from './client'
import type { SessionCreate, SessionRead } from '../types/session'

/** Create a new scoring session. */
export async function createSession(data: SessionCreate): Promise<SessionRead> {
    const response = await client.post<SessionRead>('/session', data)
    return response.data
}
