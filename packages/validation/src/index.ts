import { Middleware } from 'blubox'
import { Schema as ZodSchema, ZodError } from 'zod'
import { Schema as YupSchema, ValidationError } from 'yup'

export type OnErrorFn = (error: ZodError | ValidationError | Error) => string
export interface ValidationOptions {
	onError?: OnErrorFn
	statusCode?: number
}

const defaultOnErrorFn: OnErrorFn = error => {
	if (error instanceof ValidationError) {
		return JSON.stringify(error.errors)
	} else if (error instanceof ZodError) {
		return JSON.stringify(error.errors)
	} else {
		return error.message
	}
}

export default function validation(schema: ZodSchema | YupSchema, options?: ValidationOptions) {
	return new Middleware(async (ctx, next) => {
		try {
			if (schema instanceof YupSchema) {
				await schema.validate(ctx.request.body)
			} else if (schema instanceof ZodSchema) {
				await schema.parseAsync(ctx.request.body)
			}
			next()
		} catch (error) {
			ctx.response.status(options?.statusCode ?? 400)
			ctx.response.send(options?.onError ? options.onError(error) : defaultOnErrorFn(error))
			ctx.response.end()
		}
	})
}
