import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { type Router } from '../router'
import { type Method } from '../controllers'

export class App {
	private router: Router

	constructor(router: Router) {
		this.router = router
	}

	callback() {
		return async (request: IncomingMessage, response: ServerResponse) => {
			const { method = 'OPTION', url = '/' } = request
			const params: Record<string, string> = {}
			const controller = await this.router.find(method as Method, url, params)
			if (controller) {
				await controller.exec(request, response, params)
				return
			}
			response.statusCode = 404
			response.write('Not Found')
			response.end()
		}
	}

	listen(port: number | string, callback?: () => void) {
		const server = createServer(this.callback())
		server.listen(port, callback)
		return server
	}
}
