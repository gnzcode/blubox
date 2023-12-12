import { copyFile, readFile, unlink } from 'fs/promises'
import { Middleware, type Context } from 'blubox'
import { type File as FormidableFile, type Files, IncomingForm } from 'formidable'
import path from 'path'

export class File {
	fieldname: string
	originalname: string | null
	filename: string | null
	size: number
	extname: string | null
	path: string

	constructor(data: FormidableFile, fieldname: string) {
		this.fieldname = fieldname
		this.originalname = data.originalFilename
		this.filename = data.originalFilename
		this.size = data.size
		this.extname = data.originalFilename?.split('.').pop() ?? null
		this.path = data.filepath
	}

	async move(path: string) {
		await copyFile(this.path, path)
		await unlink(this.path)
		this.path = path
	}

	async data() {
		return await readFile(this.path)
	}
}

export interface Field {
	name: string
	maxCount?: number
}

interface OptionsBase {
	fields: (string | Field)[]
	extnames: string[]
}

interface FieldError {
	name: string
	errors: string[]
}

export interface Options extends OptionsBase {
	storage: Storage
}

export interface StorageOptions {
	destination: string | ((ctx: Context, file: File) => string | Promise<string>)
	filename: string | ((ctx: Context, file: File) => string | Promise<string>)
}

export class Storage {
	opts: StorageOptions

	constructor(opts: StorageOptions) {
		this.opts = opts
	}

	private async createFilename(ctx: Context, file: File) {
		if (typeof this.opts.filename === 'string') {
			return this.opts.filename
		}
		const filename = this.opts.filename(ctx, file)
		if (filename instanceof Promise) {
			return await filename
		}
		return filename
	}

	private async createDestination(ctx: Context, file: File) {
		if (typeof this.opts.destination === 'string') {
			return this.opts.destination
		}
		const destination = this.opts.destination(ctx, file)
		if (destination instanceof Promise) {
			return await destination
		}
		return destination
	}

	private async createPath(ctx: Context, file: File) {
		const filename = await this.createFilename(ctx, file)
		const destination = await this.createDestination(ctx, file)
		return path.join(destination, filename)
	}

	private findField(fields: (Field | string)[], fieldname: string) {
		for (const field of fields) {
			if (typeof field === 'string') {
				if (field === fieldname) return 999
				continue
			}
			if (field.name === fieldname) return field.maxCount ?? 999
		}
		return -1
	}

	async processFiles(ctx: Context, fields: Files, opts: OptionsBase) {
		const errors: FieldError[] = []
		for (const fieldname in fields) {
			const files = fields[fieldname] ?? []
			const maxCount = this.findField(opts.fields, fieldname)
			if (maxCount === -1) continue
			if (maxCount < files.length) {
				errors.push({ name: fieldname, errors: [`Limit exceeded (${maxCount})`] })
				continue
			}
			if (errors.length > 0) continue
			for (const file of files) {
				const f = new File(file, fieldname)
				const acceptExtname = opts.extnames.includes(f.extname ?? '')
				if (!acceptExtname) {
					errors.push({ name: fieldname, errors: [`Invalid file extension (${f.extname})`] })
					continue
				}
				await f.move(await this.createPath(ctx, f))
				if (ctx.state.files[fieldname]) {
					ctx.state.files[fieldname].push(f)
					continue
				}
				ctx.state.files[fieldname] = [f]
			}
		}
		return errors
	}
}

export default function multer(opts: Options) {
	return new Middleware(async (ctx, next) => {
		const form = new IncomingForm()
		const [fields, files] = await form.parse(ctx.req)
		for (const fieldname in fields) {
			const field = fields[fieldname]
			ctx.request.body[fieldname] = field && field.length === 1 ? field[0] : field
		}
		const errors = await opts.storage.processFiles(ctx, files, opts)
		if (errors.length > 0) {
			ctx.response.status(400)
			ctx.response.json(
				errors.reduce((acc, err) => {
					const index = acc.findIndex(n => n.name === err.name)
					if (index === -1) {
						acc.push(err)
					} else {
						acc[index].errors.push(...err.errors)
					}
					return acc
				}, [] as FieldError[])
			)
			ctx.response.end()
		}
		next()
	})
}
