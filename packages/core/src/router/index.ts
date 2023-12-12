import { type Method, ControllerBase } from '../controllers'

interface AllRoutes {
	'*'?: ControllerBase | ControllerBase[]
}

export type Controllers = AllRoutes & Record<string, ControllerBase | ControllerBase[] | Router>

export class Router {
	private controllers: Controllers = {}

	constructor(controllers: Controllers) {
		this.controllers = controllers
	}

	async find(method: Method, path: string, params: Record<string, string>) {
		if (path.startsWith('/') && path !== '/') path = path.replace('/', '')
		let initialParts = path.split('/')
		if (path === '/') initialParts = initialParts.slice(1)
		async function validateMethod(
			controller: ControllerBase | ControllerBase[] | Router,
			parts: string[],
			ignoreParts: boolean = false
		) {
			if (controller instanceof Router) {
				if (!ignoreParts && parts.length === 0) return null
				const existsController = await controller.find(method, parts.slice(1).join('/'), params)
				if (existsController) return existsController
			}
			if (Array.isArray(controller)) {
				if (controller.length === 0 || (!ignoreParts && parts.length > 1)) return null
				if (method === 'OPTIONS') return controller[0]
				const existsController = controller.find(ctrl => ctrl.method === method)
				if (!existsController) return null
				return existsController
			}
			if (controller instanceof ControllerBase) {
				if (!ignoreParts && parts.length > 1) return null
				if (!(method === 'OPTIONS') && controller.method !== method) return null
				return controller
			}
			return null
		}
		async function findController(
			controllers: Controllers | Router,
			parts: string[]
		): Promise<ControllerBase | null> {
			const currentPart = parts[0]
			if (!(typeof currentPart === 'string')) return null
			for (const pathname in controllers) {
				const existsExact = controllers[currentPart]
				const paramsRoute = existsExact ? false : pathname.startsWith(':')
				if (!existsExact && pathname === '*') {
					const controller = controllers[pathname]
					if (!controller) continue
					const isValidController = await validateMethod(controller, parts, true)
					if (isValidController) return isValidController
					continue
				}
				const math = pathname === currentPart
				if (paramsRoute) params[pathname.replace(':', '')] = currentPart
				if (!math && !paramsRoute) continue
				const controller = controllers[pathname]
				if (!controller) continue
				const isValidController = await validateMethod(controller, parts)
				if (isValidController) return isValidController
			}
			return null
		}
		return await findController(this.controllers, initialParts)
	}
}
