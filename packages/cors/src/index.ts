import { type Method, Middleware } from 'blubox'

export interface CorsOptions {
	allowedOrigins?: string[]
	allowedMethods?: Method[]
	allowedHeaders?: string[]
	exposedHeaders?: string[]
	maxAge?: number
	credentials?: boolean
}

export default function cors(opts: CorsOptions = {}) {
	return new Middleware((ctx, next) => {
		const allowedOrigins = opts.allowedOrigins ?? []
		const allowedMethods = opts.allowedMethods ?? ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
		const allowedHeaders = opts.allowedHeaders ?? []
		const exposedHeaders = opts.exposedHeaders ?? []
		const maxAge = opts.maxAge ?? 600
		const credentials = opts.credentials ?? false

		const origin = ctx.request.headers.origin ?? ''
		if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
			ctx.response.setHeader('Access-Control-Allow-Origin', origin)
		} else {
			ctx.response.setHeader('Access-Control-Allow-Origin', 'false')
		}
		ctx.response.setHeader('Vary', 'Origin, Access-Control-Request-Headers')
		if (exposedHeaders.length > 0) {
			ctx.response.setHeader('Access-Control-Expose-Headers', exposedHeaders.join(','))
		}
		if (credentials) {
			ctx.response.setHeader('Access-Control-Allow-Credentials', 'true')
		}
		if (ctx.request.method === 'OPTIONS') {
			ctx.response.setHeader('Access-Control-Allow-Methods', allowedMethods.join(','))
			if (allowedHeaders.length > 0) {
				ctx.response.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(','))
			} else {
				const requestAllowedHeaders = ctx.request.headers['access-control-request-headers'] ?? '*'
				ctx.response.setHeader('Access-Control-Allow-Headers', requestAllowedHeaders)
			}
			ctx.response.setHeader('Access-Control-Max-Age', maxAge.toString())
			ctx.response.status(204)
			ctx.response.setHeader('Content-Length', '0')
			ctx.response.end()
		}
		next()
	})
}
