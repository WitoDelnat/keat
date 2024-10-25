export function parseId(request: Request): string {
    const url = new URL(request.url)
    const segments = url.pathname.split('/')
    if (segments.length !== 2) {
        throw new Error()
    }
    return segments[1]
}

export function generateId() {
    return crypto.randomUUID().replaceAll('-', '')
}

export function generateKey() {
    const a = crypto.randomUUID().replaceAll('-', '')
    const b = crypto.randomUUID().replaceAll('-', '')
    return `${a}${b}`
}
