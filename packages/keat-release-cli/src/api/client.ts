import { CallOptions, createClient } from '@connectrpc/connect'
import { KeatService } from '../__codegen__/keat/core/v1/core_connect'
import { createConnectTransport } from '@connectrpc/connect-web'
import { Headers } from 'node-fetch'

const ORIGIN = 'http://localhost:8787'
const transport = createConnectTransport({ baseUrl: ORIGIN })
export const client = createClient(KeatService, transport)

export function withAuthHeader(key: string): CallOptions {
    return { headers: new Headers({ 'X-Auth-Key': key }) }
}
