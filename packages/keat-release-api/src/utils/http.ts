export const http = {
    NotFound: () => new Response('not found', { status: 404 }),
} as const

export function parseAuthHeader(request: Request): string {
    const xAuthKey = request.headers.get('X-Auth-Key')
    if (xAuthKey) {
        return xAuthKey
    }

    // TODO add Authorization headers
    throw new Error('unauthorized')
}
