import { type ServerResponse, type IncomingMessage } from 'http'
import { Context } from '../context'
import { type Middleware } from '../middlewares'

export type Method = 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH' | 'OPTIONS'
export type ControllerFn = (ctx: Context) => Promise<void> | void

export class ControllerBase {
	private middlewares: Middleware[] = []
	private fn: ControllerFn
	readonly method: Method

	constructor(method: Method, fn: ControllerFn, middlewares?: Middleware[]) {
		this.middlewares = middlewares ?? []
		this.fn = fn
		this.method = method
	}

	async exec(request: IncomingMessage, response: ServerResponse, params: Record<string, string>) {
		await new Promise((resolve, reject) => {
			const ctx = new Context(request, response)
			ctx.response.on('finish', () => {
				resolve(null)
			})
			ctx.request.params = params
			for (const middleware of this.middlewares) {
				middleware.exec(ctx).catch(err => {
					ctx.response.status(500)
					ctx.response.json({
						code: 'INTERNAL_ERROR',
						message: err,
					})
					ctx.response.end()
				})
			}
			const result = this.fn(ctx)
			if (result instanceof Promise) {
				result.catch(err => {
					ctx.response.status(500)
					ctx.response.json({
						code: 'INTERNAL_ERROR',
						message: err,
					})
					ctx.response.end()
				})
			}
		})
	}
}

export class Controller {
	private middlewares: Middleware[] = []

	constructor(middlewares?: Middleware[]) {
		this.middlewares = middlewares ?? []
	}

	use(...middlewares: Middleware[]) {
		return new Controller(middlewares)
	}

	get(fn: ControllerFn) {
		return new ControllerBase('GET', fn, this.middlewares)
	}

	post(fn: ControllerFn) {
		return new ControllerBase('POST', fn, this.middlewares)
	}

	put(fn: ControllerFn) {
		return new ControllerBase('PUT', fn, this.middlewares)
	}

	patch(fn: ControllerFn) {
		return new ControllerBase('PATCH', fn, this.middlewares)
	}

	delete(fn: ControllerFn) {
		return new ControllerBase('DELETE', fn, this.middlewares)
	}
}
