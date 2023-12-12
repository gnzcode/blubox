import { Controller, Router } from 'blubox'
import fs from 'fs'
import mime from 'mime-types'
import path from 'path'
import { type Writable } from 'stream'

export interface AssetsProps {
	dir: string
	replace: string
}

export default function assets(props: AssetsProps, controller: Controller = new Controller()) {
	return new Router({
		'*': controller.get(async ctx => {
			const filename = ctx.request.url.replace(props.replace, '')
			const filePath = path.join(props.dir, filename)

			fs.stat(filePath, (err, stats) => {
				if (err) {
					ctx.response.status(404)
					ctx.response.send('File not found')
					ctx.response.end()
					return
				}

				const extname = filename.split('.').pop()
				if (extname) {
					const contentType = mime.contentType(extname)
					ctx.response.setHeader(
						'Content-Type',
						typeof contentType === 'string' ? contentType : 'text/plain'
					)
				} else {
					ctx.response.setHeader('Content-Type', 'text/plain')
				}

				const fileStream = fs.createReadStream(filePath)
				fileStream.on('error', () => {
					ctx.response.status(500)
					ctx.response.send('Internal Server Error')
					ctx.response.end()
				})
				fileStream.pipe(ctx.response as Writable)
				fileStream.on('end', () => {
					ctx.response.end()
				})
			})
		}),
	})
}
