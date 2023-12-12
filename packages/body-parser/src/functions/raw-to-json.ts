export function rawToJson(buffer: Buffer) {
	return JSON.parse(buffer.toString('utf-8'))
}
