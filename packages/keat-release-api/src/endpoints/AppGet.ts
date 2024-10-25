import { OpenAPIRoute } from 'chanfana'
import { Context } from 'env'
import { encodeResponse } from 'utils/general'
import { http, parseAuthHeader } from 'utils/http'
import { App } from '../types'

export class AppGet extends OpenAPIRoute {
    schema = {
        summary: 'Create a new application',
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
        const id = c.req.param('id')
        const url = new URL(c.req.raw.url)
        const hasFlags = url.searchParams.has('flags')

        if (hasFlags) {
            const keatDoc = await c.env.BUCKET.get(`${id}/feature-flags.json`)
            if (!keatDoc) {
                return http.NotFound()
            }
            const flags = await keatDoc.text()
            return new Response(flags, {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            })
        }

        const key = parseAuthHeader(c.req.raw)
        const keatDoc = await c.env.BUCKET.get(`${id}/${key}.json`)
        if (!keatDoc) {
            return http.NotFound()
        }
        const spec = await keatDoc?.json<any>()
        const response = encodeResponse(c.req.raw, spec)
        response.headers.append('Access-Control-Allow-Origin', '*')
        return response
    }
}
