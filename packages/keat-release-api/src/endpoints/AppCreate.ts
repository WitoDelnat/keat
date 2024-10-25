import { OpenAPIRoute, Str } from 'chanfana'
import { z } from 'zod'
import { createNewApp } from '../types'
import { compile } from 'utils/compile'
import { generateId, generateKey } from 'utils/general'
import { Context } from 'env'

export class AppCreate extends OpenAPIRoute {
    schema = {
        summary: 'Create a new application',
        request: {
            body: {
                content: {
                    'application/json': {
                        schema: z.object({
                            name: Str({ required: false }),
                            feature: Str({ required: false }),
                        }),
                    },
                },
            },
        },
        responses: {
            '200': {
                description: 'Returns the created application',
                content: {
                    'application/json': {
                        schema: z.object({
                            id: Str(),
                            key: Str(),
                        }),
                    },
                },
            },
        },
    }

    async handle(c: Context) {
        const data = await this.getValidatedData<typeof this.schema>()
        const id = generateId()
        const key = generateKey()
        const spec = createNewApp({
            name: data.body.name,
            feature: data.body.feature,
        })

        try {
            await Promise.all([
                c.env.BUCKET.put(`${id}/${key}.json`, JSON.stringify(spec)),
                c.env.BUCKET.put(
                    `${id}/feature-flags.json`,
                    JSON.stringify(compile(spec, id))
                ),
            ])

            const response = c.json({ id, key })
            response.headers.append('Access-Control-Allow-Origin', '*')
            return response
        } catch (err) {
            console.error('err', err)
            return new Response('cannot create application', { status: 500 })
        }
    }
}
