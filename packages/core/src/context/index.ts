import { type ServerResponse, type IncomingMessage, type IncomingHttpHeaders } from 'http'
import { Writable } from 'stream'

export class Cookies {
	private request: IncomingMessage
	private response: ServerResponse
	private cookies: Record<string, any>

	constructor(request: IncomingMessage, response: ServerResponse) {
		this.request = request
		this.cookies = this.parseCookies()
		this.response = response
	}

	get(name: string): string | undefined {
		return this.cookies[name]
	}

	getValues() {
		return this.cookies
	}

	set(name: string, value: string, options: Record<string, any> = {}): void {
		const cookieOptions = { ...options, path: '/' }
		const cookie = `${name}=${value}; ${this.serializeOptions(cookieOptions)}`
		this.response.setHeader('Set-Cookie', cookie)
	}

	remove(name: string): void {
		this.set(name, '', { expires: new Date(0) })
	}

	private parseCookies(): Record<string, any> {
		const cookieHeader = this.request.headers.cookie ?? ''
		return cookieHeader.split(';').reduce((cookies, cookie) => {
			const [name, value] = cookie.trim().split('=')
			cookies[name] = value
			return cookies
		}, {})
	}

	private serializeOptions(options: Record<string, any>): string {
		return Object.entries(options)
			.map(([key, value]) => `${key}=${value}`)
			.join('; ')
	}
}

export class Request {
	method: string
	url: string
	headers: IncomingHttpHeaders

	protocol: string
	hostname: string
	path: string
	query: Record<string, string>
	params: Record<string, string>
	body: any

	constructor(request: IncomingMessage) {
		this.method = request.method ?? ''
		this.url = request.url ?? ''
		this.headers = request.headers ?? {}
		const parsedUrl = new URL(request.url ?? '', 'http://localhost')
		this.protocol = parsedUrl.protocol ?? ''
		this.hostname = parsedUrl.hostname ?? ''
		this.path = parsedUrl.pathname
		this.query = this.parseQueryString(request.url ?? '')
		this.params = {}
	}

	private parseQueryString(url: string): Record<string, string> {
		const queryString = new URL(url, 'http://localhost').searchParams
		const query: Record<string, string> = {}
		queryString.forEach((value, key) => {
			query[key] = value
		})
		return query
	}
}

export class Response extends Writable {
	private response: ServerResponse

	constructor(response: ServerResponse) {
		super({
			write(chunk: any, encoding: BufferEncoding, callback?: (error?: Error | null) => void) {
				response.write(chunk, encoding, callback)
			},
		})
		this.response = response
	}

	status(code: number) {
		this.response.statusCode = code
		return this
	}

	setHeader(name: string, value: string) {
		this.response.setHeader(name, value)
		return this
	}

	send(body: string | Buffer) {
		if (!this.response.headersSent) {
			this.setHeader('Content-Type', 'text/plain')
		}

		this.write(body)
	}

	json(data: Record<string, any>) {
		if (!this.response.headersSent) {
			this.setHeader('Content-Type', 'application/json')
		}
		this.write(JSON.stringify(data))
	}

	end(cb?: (() => void) | undefined) {
		this.response.end(cb)
		return this
	}
}

export class Context {
	req: IncomingMessage
	res: ServerResponse
	response: Response
	request: Request
	state: Record<string, any>
	cookies: Cookies

	constructor(request: IncomingMessage, response: ServerResponse) {
		this.req = request
		this.res = response
		this.request = new Request(request)
		this.cookies = new Cookies(request, response)
		this.response = new Response(response)
		this.state = {}
	}
}
