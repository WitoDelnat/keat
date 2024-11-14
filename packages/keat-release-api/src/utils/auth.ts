export async function createAuthKey(
    id: string,
    password: string,
    secret: string
) {
    const text = new TextEncoder().encode(`${id}-${password}-${secret}`)
    const digest = await crypto.subtle.digest(
        {
            name: 'SHA-256',
        },
        text
    )
    const hex = [...new Uint8Array(digest)]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
    return hex
}

export async function hash(s: string): Promise<string> {
    const b = new TextEncoder().encode(s)
    const digest = await crypto.subtle.digest(
        {
            name: 'SHA-256',
        },
        b
    )
    const hex = [...new Uint8Array(digest)]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
    return hex
}
