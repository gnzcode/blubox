import { parseString } from 'xml2js'

export async function parseXml(buffer: Buffer) {
	const xmlString = buffer.toString('utf-8')
	return (await parseXmlString(xmlString)) ?? {}
}

async function parseXmlString(xmlString: string): Promise<object> {
	return await new Promise((resolve, reject) => {
		parseString(xmlString, (err, result) => {
			if (err !== null) {
				reject(err)
			} else {
				resolve(result)
			}
		})
	})
}
