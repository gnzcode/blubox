# Validation Middleware

A middleware for request body validation using schema validation libraries such as Zod or Yup.

## Installation

```bash
npm install @your-namespace/validation-middleware
```

## Usage

```js
const { Controller } = require('blubox');
const { Schema as ZodSchema, ZodError } = require('zod');
const { Schema as YupSchema, ValidationError } = require('yup');
const validation = require('@blubox/validation');

// Define your Zod or Yup schema
const zodSchema = ZodSchema.object({
  name: ZodSchema.string(),
  age: ZodSchema.number(),
});

// Define middleware options
const validationOptions = {
  onError: error => {
    if (error instanceof ValidationError) {
      return JSON.stringify(error.errors);
    } else if (error instanceof ZodError) {
      return JSON.stringify(error.errors);
    } else {
      return error.message;
    }
  },
  statusCode: 400,
};

// Create the validation middleware
const validationMiddleware = validation(zodSchema, validationOptions);

const controller = new Controller()
controller.use(validationMiddleware)
```

## Options

`onError`: Custom error handling function. Default is a function that formats errors into JSON strings.
`statusCode`: HTTP status code to set on validation failure. Default is 400.

## License

[MIT](https://github.com/gnzcode/blubox/blob/main/LICENSE.md)
