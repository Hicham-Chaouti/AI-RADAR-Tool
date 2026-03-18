import client from './client'

/** Download PDF export for a session. */
export async function exportPdf(sessionId: string): Promise<Blob> {
    const response = await client.get(`/export/pdf/${sessionId}`, {
        responseType: 'blob',
    })
    return response.data
}
