import { type ConnectRouter } from '@connectrpc/connect'
import { connectWorkersAdapter } from '@depot/connectrpc-workers'
import { KeatService } from '__codegen__/keat/core/v1/core_connect'
import { createApp } from 'handlers/createApp'
import { getApp } from 'handlers/getApp'
import { createContextValues } from './utils/context'
import { updateApp } from 'handlers/updateApp'
import { toggle } from 'handlers/toggle'

function routes(router: ConnectRouter) {
    router.rpc(KeatService, KeatService.methods.createApp, createApp)
    router.rpc(KeatService, KeatService.methods.getApp, getApp)
    router.rpc(KeatService, KeatService.methods.updateApp, updateApp)
    router.rpc(KeatService, KeatService.methods.toggle, toggle)
}

const handler = connectWorkersAdapter<Env>({
    routes,
    contextValues(request, env) {
        return createContextValues({
            appKey: request.headers.get('X-Auth-Key'),
            storage: env.BUCKET,
        })
    },
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST',
    'Access-Control-Allow-Headers':
        'Content-Type, Connect-Protocol-Version, Connect-Timeout-Ms, X-User-Agent, X-Auth-Key',
    'Access-Control-Max-Age': '86400',
}

export default {
    async fetch(request, env, context) {
        if (request.method === 'OPTIONS') {
            return new Response('', {
                headers: corsHeaders,
            })
        }
        if (request.method === 'GET') {
            const pathname = new URL(request.url).pathname
            const [_, app] = pathname.split('/')
            if (!app) return new Response('not found', { status: 404 })
            const keatDoc = await env.BUCKET.get(`${app}/feature-flags.json`)
            if (!keatDoc) return new Response('not found', { status: 404 })
            return new Response(keatDoc.body, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            })
        }

        const response = await handler(request, env, context)
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST')
        return response
    },
} satisfies ExportedHandler<Env>
