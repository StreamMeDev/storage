# A Web Storage Wrapper

[![js-happiness-style](https://img.shields.io/badge/code%20style-happiness-brightgreen.svg)](https://github.com/JedWatson/happiness)

Web storage for cookies/localStorage/sessionStorage/memory with expiration and other helpful features.

**Features:**

- Multiple storage drivers guarantee at minimum in memory storage
- Filter value, useful for storing json or other non-string data
- Filter key, useful for consolidating keys
- Use cookie like path and expires with local and session storage

## Install

```
$ npm install --save @streamme/storage
```

## Usage

```javascript
var Storage = require('@streamme/storage');

var store = new Storage({
	// backend: null, specify a backend with either a 
	// string name or constructor function
	backend: 'memory'

	// Sets the domain, only used with cookies
	domain: 'example.com',

	// Filter function for getting and settting
	setValueFilter: identity,
	getValueFilter: identity,

	// Filter function for the key
	keyFilter: identity
});

store.setItem('foo', 'bar');
store.getItem('foo'); // 'bar'
store.removeItem('foo');
store.getItem('foo'); // undefined
store.clear('foo'); // undefined
```

## Contributing

Contributions are welcome.  Please see our guidelines in [CONTRIBUTING.md](contributing.md).
