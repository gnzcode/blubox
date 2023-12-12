# Body Parser Middleware

> A middleware for parsing request bodies in various formats, including JSON, raw data, urlencoded, and XML.

## Installation

```bash
npm install @blubox/body-parser
```

## Usage

```js
const bodyParser, { BodyParserOptions } = require('@blubox/body-parser')

const jsonParser = bodyParser.json()
const rawParser = bodyParser.raw()
const urlencodedParser = bodyParser.urlencoded()
const xmlParser = bodyParser.xml()

// Use the middleware in your application

controller.use(jsonParser)
controller.use(rawParser)
controller.use(urlencodedParser)
controller.use(xmlParser)
```

## Options

- limit (optional): Set a limit on the request body size. Default is unlimited. Example: { limit: '1mb' }
- requiredHeaders (optional): Array of headers that must be present in the request. Example: { requiredHeaders: ['Content-Type'] }
- disallowedHeaders (optional): Array of headers that must not be present in the request. Example: { disallowedHeaders: ['Authorization'] }
- strictMode (optional): Enable strict mode to enforce all specified options. Default is false. Example: { strictMode: true }

## Size Units

Size limits can be specified using units such as 'kb', 'mb', 'gb', or 'tb'. Example: '1mb', '100kb'.

## Middleware Methods

`json(opts?: BodyParserOptions)`

Parses the request body as JSON.

`raw(opts?: BodyParserOptions)`

Retrieves the raw request body.

`urlencoded(opts?: BodyParserOptions)`

Parses the request body as urlencoded data.

`xml(opts?: BodyParserOptions)`

Parses the request body as XML.

## License

[MIT](https://github.com/gnzcode/blubox/blob/main/LICENSE.md)
