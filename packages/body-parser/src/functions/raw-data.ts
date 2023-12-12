import { type IncomingMessage } from 'http'

export async function getRawData(request: IncomingMessage): Promise<Buffer> {
	return await new Promise((resolve, reject) => {
		let raw = Buffer.from('')

		request.on('data', chunk => {
			raw = Buffer.concat([raw, chunk])
		})

		request.on('end', () => {
			resolve(raw)
		})

		request.on('error', error => {
			reject(error)
		})
	})
}
