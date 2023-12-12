# CORS Middleware

A middleware for handling Cross-Origin Resource Sharing (CORS) in your web server.

## Installation

```bash
npm install @blubox/cors
```

## Usage

```js
const cors, { CorsOptions } = require('@blubox/cors')
const { Controller } = require('blubox')

const controller = new Controller()
controller.use(cors(/* optional CorsOptions */))
```

## Options

`allowedOrigins (optional)`: Array of allowed origins. Default is an empty array.
`allowedMethods (optional)`: Array of allowed HTTP methods. Default is ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'].
`allowedHeaders (optional)`: Array of allowed headers. Default is an empty array.
`exposedHeaders (optional)`: Array of headers exposed to the client. Default is an empty array.
`maxAge (optional)`: The maximum time (in seconds) that a preflight request may be cached. Default is 600.
`credentials (optional)`: Boolean indicating whether credentials (e.g., cookies) should be included. Default is false.

## License

[MIT](https://github.com/gnzcode/blubox/blob/main/LICENSE.md)
