# Multer Middleware

A middleware for handling file uploads in your web server.

## Installation

```bash
npm install @blubox/multer
```

## Usage

```js

const multer, { Options, File, Storage } = require('@blubox/multer')
const { Controller } = require('blubox')

// Define storage options
const storageOptions = {
  destination: './uploads',
  filename: (ctx, file) => `${Date.now()}-${file.originalname}`
};

// Initialize storage
const storage = new Storage(storageOptions);

// Define multer options
const multerOptions: Options = {
  fields: ['image', 'document'],
  extnames: ['.jpg', '.png', '.pdf'],
  storage: storage
};

// Create the multer middleware
const multerMiddleware = multer(multerOptions);

const controller = new Controller()
controller.use(multerMiddleware)
```

## Options

`fields`: Array of field names or objects with name and maxCount properties.
`extnames`: Array of allowed file extensions.
`storage`: Instance of the Storage class.

## Storage Class

The Storage class provides methods for creating filenames, destinations, and paths based on user-defined functions or strings.

```js
const storage = new Storage({
	destination: (ctx, file) => './uploads',
	filename: (ctx, file) => `${Date.now()}-${file.originalname}`,
})
```

## License

[MIT](https://github.com/gnzcode/blubox/blob/main/LICENSE.md)
