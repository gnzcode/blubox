# @blubox/assets

> Serve static files with Blubox

### Installation

```bash
npm i @blubox/assets
```

### Quick start

Install dependencies

```bash
npm install blubox @blubox/assets
```

Create a Blubox application

```js
const { Controller, Router, App } = require('blubox')

const controller = new Controller()

const app = new App(new Router({}))
app.listen(3000)
```

Use assets controller

```js
const assets = require('@blubox/assets')
const path = require('path')

const app = new App(
	new Router({
		assets: assets({ dir: path.join(__dirname, '../public'), replace: 'assets' }),
	})
)
```

### Assets Options

```js
/**
 * assets(options, controller)
 *
 * @param {Object} [options]
 *  - {String} dir `Absolute location of file directory`
 *  - {String} raplace `Patname of the path where the files controller is located`
 * @return {Function} assets controller
 *
 */
```

### License

[MIT](https://github.com/gnzcode/blubox/blob/main/LICENSE.md)
