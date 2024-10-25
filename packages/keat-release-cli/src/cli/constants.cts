export let API_ENDPOINT = 'https://api.keat.app'
export let WEB_ORIGIN = 'https://keat.app'

export function setDevelop(develop?: boolean) {
    if (develop) {
        API_ENDPOINT = 'http://localhost:8787'
        WEB_ORIGIN = 'http://localhost:3045'
    }
}
