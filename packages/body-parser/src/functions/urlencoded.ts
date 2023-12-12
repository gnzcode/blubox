import querystring from 'querystring'

export async function parseUrlencoded(buffer: Buffer) {
	const bodyString = buffer.toString('utf-8')
	return querystring.parse(bodyString)
}
