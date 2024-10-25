import { OpenAPIRoute } from 'chanfana'
import { Context } from 'env'
import { compile } from 'utils/compile'
import { decodeRequest, encodeResponse } from 'utils/general'
import { http, parseAuthHeader } from 'utils/http'
import { App } from '../types'

export class AppPut extends OpenAPIRoute {
    schema = {
        summary: 'Create a new application',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: App,
                    },
                },
            },
        },
        responses: {
            '200': {
                description: 'Returns the created application',
                content: {
                    'application/json': {
                        schema: App,
                    },
                },
            },
        },
    }

    async handle(c: Context) {
        try {
            const id = c.req.param('id')
            const key = parseAuthHeader(c.req.raw)

            const d = await c.env.BUCKET.head(`${id}/${key}.json`)
            if (d === null) {
                return http.NotFound()
            }

            const spec = await decodeRequest(c.req.raw)
            const flags = compile(spec, id)
            await Promise.all([
                c.env.BUCKET.put(`${id}/${key}.json`, JSON.stringify(spec)),
                c.env.BUCKET.put(
                    `${id}/feature-flags.json`,
                    JSON.stringify(flags)
                ),
            ])

            const response = encodeResponse(c.req.raw, spec)
            response.headers.append('Location', id)
            response.headers.append('X-Auth-Key', key)
            response.headers.append('Access-Control-Allow-Origin', '*')
            return response
        } catch (err) {
            console.error('[error] cannot update application', err)
            return new Response('cannot update application', { status: 500 })
        }
    }
}
