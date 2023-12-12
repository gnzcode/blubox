import { type Context, Middleware } from 'blubox'
import { getRawData } from './functions/raw-data'
import { rawToJson } from './functions/raw-to-json'
import { parseXml } from './functions/raw-to-xml'
import { parseUrlencoded } from './functions/urlencoded'

export type SizeUnit = `${number}mb` | `${number}kb` | `${number}gb` | `${number}tb`
export interface BodyParserOptions {
	limit?: SizeUnit
	requiredHeaders?: string[]
	disallowedHeaders?: string[]
	strictMode?: boolean
}

export default class bodyParser {
	private static async getData(ctx: Context, opts: BodyParserOptions) {
		const rawData = await getRawData(ctx.req)

		if (!ctx.req.complete) {
			ctx.response.status(400)
			ctx.response.send('Incomplete request')
			ctx.response.end()
		}

		if (opts.limit) {
			const limitInBytes = parseSize(opts.limit)
			if (rawData.length > limitInBytes) {
				ctx.response.status(400)
				ctx.response.send('Request body size exceeds the specified limit')
				ctx.response.end()
			}
		}
		if (opts.requiredHeaders) {
			for (const header of opts.requiredHeaders) {
				if (!ctx.request.headers[header]) {
					ctx.response.status(400)
					ctx.response.send(`Missing required header: ${header}`)
					ctx.response.end()
				}
			}
		}

		if (opts.disallowedHeaders) {
			for (const header of opts.disallowedHeaders) {
				if (ctx.request.headers[header]) {
					ctx.response.status(400)
					ctx.response.send(`Disallowed header present: ${header}`)
					ctx.response.end()
				}
			}
		}
		return rawData
	}

	static json(opts: BodyParserOptions = {}) {
		return new Middleware(async (ctx, next) => {
			const rawData = await this.getData(ctx, opts)
			ctx.state.rawBody = rawData
			const contentType = ctx.request.headers['content-type']
			if (contentType && contentType.includes('application/json')) ctx.request.body = rawToJson(rawData)
			next()
		})
	}

	static raw(opts: BodyParserOptions = {}) {
		return new Middleware(async (ctx, next) => {
			ctx.request.body = await this.getData(ctx, opts)
			next()
		})
	}

	static urlencoded(opts: BodyParserOptions = {}) {
		return new Middleware(async (ctx, next) => {
			const rawData = await this.getData(ctx, opts)
			ctx.state.rawBody = rawData
			const contentType = ctx.request.headers['content-type']
			if (contentType && contentType.includes('application/x-www-form-urlencoded'))
				ctx.request.body = await parseUrlencoded(rawData)
			next()
		})
	}

	static xml(opts: BodyParserOptions = {}) {
		return new Middleware(async (ctx, next) => {
			const rawData = await this.getData(ctx, opts)
			ctx.state.rawBody = rawData
			const contentType = ctx.request.headers['content-type']
			if (contentType && contentType.includes('application/xml')) ctx.request.body = await parseXml(rawData)
			next()
		})
	}
}

class BodyParserError extends Error {}

function parseSize(size: SizeUnit) {
	const units = {
		kb: 1024,
		mb: 1024 * 1024,
		gb: 1024 * 1024 * 1024,
		tb: 1024 * 1024 * 1024 * 1024,
	}

	const regex = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/
	const match = size.match(regex)

	if (!match) {
		throw new BodyParserError('Invalid size format')
	}

	const value = parseFloat(match[1])
	const unit = match[2].toLowerCase()

	if (!units[unit]) {
		throw new BodyParserError('Invalid unit')
	}

	return value * units[unit]
}
