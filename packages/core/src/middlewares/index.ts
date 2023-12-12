import { type Context } from '../context'

export class Middleware {
	private fn: (ctx: Context, next: () => void) => Promise<void> | void

	constructor(fn: (ctx: Context, next: () => void) => Promise<void> | void) {
		this.fn = fn
	}

	async exec(ctx: Context) {
		return await new Promise((resolve, reject) => {
			try {
				const result = this.fn(ctx, resolve as () => void)
				if (result instanceof Promise) {
					result.catch(err => {
						reject(err)
					})
				}
			} catch (error) {
				reject(error)
			}
		})
	}
}
