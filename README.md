# Klient

![badge-coverage](.github/badges/coverage.svg)

- [Introduction](#introduction)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Klient instance](#klient-instance)
  * [Parameters](#parameters)
  * [Properties](#properties)
  * [Methods](#methods)
    + [request](#request)
    + [get](#get)
    + [post](#post)
    + [put](#put)
    + [patch](#patch)
    + [delete](#delete)
    + [head](#head)
    + [options](#options)
    + [file](#file)
    + [on](#on)
    + [once](#once)
    + [off](#off)
    + [load](#load)
    + [extends](#extends)
    + [cancelPendingRequests](#cancelpendingrequests)
- [Events](#events)
  * [Listeners](#listeners)
  * [Workflow](#workflow)
  * [RequestEvent](#requestevent)
  * [RequestSuccessEvent](#requestsuccessevent)
  * [RequestErrorEvent](#requesterrorevent)
  * [RequestDoneEvent](#requestdoneevent)
  * [RequestCancelEvent](#requestcancelevent)
  * [Dispatch events](#dispatch-events)
- [Services](#services)
- [Extensions](#extensions)
  * [Create an extension](#create-an-extension)
  * [Share an extension](#share-an-extension)
  * [Used a shared extension](#used-a-shared-extension)
- [Request](#request)
  * [Cancel](#cancel)
  * [Resolve/Reject manually](#resolve-reject-manually)
  * [Execute request manually](#execute-request-manually)
- [Debug](#debug)

&nbsp;

# Klient


## Introduction

Klient is a very light weight library able to build advanced http client. It's wrapping the amazing [Axios](https://github.com/axios/axios) library to execute http requests. Klient purposes to emit events before and after a request execution, whose allows to work with requests unitarily and globally. During an event emission, listeners are called one by one sorted by their own defined priority. They can work with the request configuration before its execution, and with the result after. In specific cases, a listener can suspend temporary the request process to realize an async task (for exemple, refresh credentials).

With its features, Klient is perfect to build the most adapted client for your target webservice.

**Why should I use Klient ?**

  - I need to make http requests on my website or in a node project

  - I need a way to make my http requests evolutive

  - I want to work on my front project but the target webservice is not ready yet

  - I love to enable features by using extensions simply

  - I want to produce readable and reusable code

  - My project is using Typescript


Klient is modulable by using extensions, a way to reuse features across your projects, by enabling them on your needs only.

See below the list of official usable extensions :

| Name                                                | Description                                      | Available  |
|-----------------------------------------------------|--------------------------------------------------|------------|
| [@klient/jwt](https://github.com/klientjs/jwt)      | Manage requests authentication using jwt.        |     ✅     |
| [@klient/rest](https://github.com/klientjs/rest)    | Consume REST APIs.                               |     ✅     |
| [@klient/mock](https://github.com/klientjs/mock)    | Mock responses of defined requests.              |     ✅     |
| @klient/cache                                       | Limit api calls by caching responses.            |     ❌     |
| @klient/offline                                     | Purpose an offline mode.                         |     ❌     |
| @klient/graphql                                     | Perform graphql queries.                         |     ❌     |
| @klient/soap                                        | Consume SOAP APIs.                               |     ❌     |

*We can imagine a lot of possibilities, of course you can open an issue to purpose your own.*

**Additionally, you can refer to the [example implementation](https://github.com/klientjs/example) of Klient packages, used in a web project based on React which consumes a full mocked REST API.**

## Requirements

- [Node](https://nodejs.org/) >= v12


## Installation

Install core package with your favorite package manager :

```shell
# With NPM
$ npm install @klient/core

# With YARN
$ yarn add @klient/core
```


## Usage

```js
import Klient from '@klient/core';
import { Resource } from '@klient/rest';

// Register extensions we need
import '@klient/jwt';
import '@klient/rest';

//
// -> @klient/core
//
// Configure a Klient instance for the target URL (only)
// Klient is representing like an "SDK" of your API
//
const klient = new Klient({
  url: 'http://example.rest/api',                   // Target host
  debug: true,                                      // Debug mode
  extensions: ['@klient/jwt', '@klient/rest'],      // Extension to load in this Klient instance
  request: {                                        // Static Axios request config to apply for every request
    headers: {
      'Content-Type': 'application/json',
    }
  }
});


//
// -> Need 1 - Create a resource for REST apis (see @klient/rest Extension)
//

// Step 1 - Register a resource
// We need to regisert a "Resource", usable after as a service. It will be the "repository" of a single resource in API.
// By default, it allows to you to perform create|read|list|update|delete actions according to REST principles.
klient.register('Post', '/posts');

// Step 2 - Call any resource CRUD action, automatically configured. Don't reinvent the wheel...
klient
  .resource('Post')
  .create({
    title: 'My first post',
    description: 'Not in the mood, I should ask Chat GPT to handle this part...'
  })
  .then((responseData) => {
    // Hide a form, show success message, redirect user, sell data to China ? 
  })
  .catch((axiosError) => {
    // Display an error, handle validation error, tell the user it is his fault ? 
  })
  ;

// Optionnaly listen when request build with REST package will be executed
klient.on('request', e => {
  if (e.context.action === 'create' && e.context.rest === true) {
    console.log('A Post is going to be created');
  }
});


//
// -> Need 2 - Add custom action in my resource. No Problemo
//

// Step 1 - Create a resource
// A REST Resource is a service usable anywhere in your code, supposed to manage a single resource in API
// It can be considerated like a "repository". The "Resource" class contains the default create|read|list|update|delete methods.
class PostResource extends Resource {
  constructor() {
    // Alias, entrypoint
    super('Post', '/posts');
  }

  // Defines as many methods you need in your resource
  activate(itemOrId, activate = true) {
    return this.request({                       // This method returns a Promise fulfilled with Request result
      url: this.uri(itemOrId, 'activate'),    // Build the uri like /posts/id/activate
      data: { activate },                     // Send data
      method: 'PUT',                          // Supported method of target entrypoint
      context: {                              // Set context values usable by listeners
        action: 'activate'
      }
    });
  }
}

// Step 2 - Register your custom resource
klient.register(new PostResource());

// Step 2 - just call any custom action defined in your Resource class
klient
  .resource('Post')
  .activate('...')
  .then(() => {
    console.log('We activated the post !');
  })
;


//
// -> Need 3 - Make authenticated calls (see @klient/jwt Extension)
//

// Step 1 - Configure request made for authentication
klient.parameters.set('jwt', {
  // Configure token entrypoint
  login: {
    url: '/auth',
    method: 'POST'
  },
  // Configure refresh token entrypoint (optional)
  refresh: {
    url: '/auth/refresh',
    method: 'POST'
  },
  // Persist authentication state in a cookie (optional)
  storage: {
    type: 'cookie',
    options: {
      name: 'test',
      path: '/'
    }
  }
});

klient
  // You can optionally listen for login success
  .on('jwt:authenticate', () => {
    console.log('My user has getting a new token, maybe i should make him appear as logged in my app');
  })
  // You can optionnaly listen for credentials expiration
  .on('jwt:expired', () => {
    console.log('Oops, credentials has expired, maybe i should redirect user to login page ?');
  })
;

klient.on('jwt:expired', () => {
  console.log('Oops, credentials has expired, maybe i should redirect user to login page ?');
});

// Step 2 - Log the user in!
klient
  // Fetch a token with credentials as expected in your API
  .login({ username: '...', password: '...' })
  .then(() => {
    // At this point, jwt:authenticate event has been emitted
    // and every new request will contains the fetched token in header
    // it will be added by an event listener (on request) of @klient/jwt extension
    // Note that token can be au
  })
;

// Step 3 - Make calls!
// Use our Post resource service to make "list" action
klient
  .resource('Post')
  .list()
  .then((responseData) => {
    // Too much posts fetched with so few lines, Mouahaha
  })
;
```

## Klient instance

Klient instance is building with 2 services in a container. They are the core of whole library : `factory` (able to create Request instance) and `dispatcher` (able to register listeners and emit events). The methods of klient instance are just shortcuts to theses services methods. You can add your own services to reuse some code anywhere.

Klient instance is also initialized with a parameters bag, where the configuration is stored and used to setup the Klient behaviour and its extensions. The extensions are used to add specific features by adding services, listeners, whose processing can be conditioned by its own parameters. You can use an existing extension or create your own by simple way.


### Parameters

The Klient constructor is an object representing the parameters used to initialize the parameter bag of returned instance. It's stored as a deep object and the values are accessible from Klient instance. Nested property can be read/write by using dot notation.

| Name       | Description                                                  | Type                                                                                                                                   | Default   |
|------------|--------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------|-----------|
| url        | Base url used for requests                                   | `string \| undefined`                                                                                                                  | undefined |
| request    | Static axios config to merge with all request config         | `AxiosRequestConfig \| undefined`                                                                                                      | undefined |
| extensions | Restrict extensions you want to load on new klient instance. | `string[] \| undefined` : use an empty array to init your klient with no extensions. Contrariwise, undefined means all extensions.     | undefined |
| debug      | Enable debug mode                                            | `boolean \| undefined`                                                                                                                 | false     |

The parameters can be extended with any property containing any value !

*Usage*

```js
import Klient from '@klient/core';


//
// With no parameters
// Equal to new Klient('http://127.0.0.1');
//
new Klient();


//
// With base url as uniq parameter
//
new Klient('https://api.example.com/v1');


//
// With several parameters
//
new Klient({
  url: 'https://api.example.com/v1',
  extensions: [],
  debug: true,
  request: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});


//
// Read parameter
// 
klient.parameters.get('request.headers');


//
// Set a new parameter
// 
klient.parameters.set('env', 'dev');


//
// Overwrite a parameter dynamically
// 
klient.parameters.set('request.headers', {
  'Content-Type': 'application/json',
  'Authorization': 'Test',
});


//
// Recursively merge existant parameters with new ones
// 
klient.parameters.merge({
  request: {
    headers: {
      'Authorization': 'Test',
    }
  }
});
```

### Properties

| Name       | Type                        | Description                                   |
|------------|-----------------------------|:----------------------------------------------|
| url        | `string` *readonly*         | The value of url defined into parameters.     |
| extensions | `string[]` *readonly*       | The name of loaded extensions.                |
| debug      | `boolean`                   | Is debug mode enabled.                        |
| parameters | `Bag` *readonly*            | Get parameters.                               |
| services   | `Bag` *readonly*            | Get services.                                 |
| factory    | `RequestFactory` *readonly* | Get factory instance from services.           |
| dispatcher | `Dispatcher` *readonly*     | Get dispatcher instance from services.        |

*Usage*

```js
import Klient from '@klient/core';

//
// Initialize Klient instance with parameters
//
const klient = new Klient({
  url: 'https://api.example.com/v1',
  extensions: [],
  debug: false,
  request: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});



//
// Use Klient properties
//
console.log(
  klient.url,              // Print "https://api.example.com/v1"
  klient.extensions,       // Print []
  klient.debug,            // Print false
  klient.parameters.all(), // Print all defined parameters 
  klient.services.all(),   // Print all defined services 
  klient.factory,          // Print RequestFactory instance 
  klient.dispatcher,       // Print Dispatcher instance 
);
```

### Methods

#### request
---

Perform an http request.

```typescript
request(urlOrConfig: string | KlientRequestConfig | AxiosRequestConfig): Request<AxiosResponse>
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient(...);


//
// Add listener on request event to listen specific context
//
klient.on('request', e => {
  if (e.context.action === 'create') {
    // Do something ...
  }
});


//
// A Request object is a Promise, fulfilled only after execution of every listeners attached to request events
// You can define "context" property, it can be used by listeners
//
const request = klient.request({
  url: '/messages',
  method: 'POST',
  data: { content: 'Hello, world !' },
  context: {
    action: 'create',
  },
});


//
// The Request is fulfilled as Axios does with its returned Promise
//
request
  .then(axiosResponse => {
    console.log(
      axiosResponse.status, // Print response http status code
      axiosResponse.data,   // Print response content
    )
  })
  .catch(axiosError => {
    if (axiosError.response) {
      console.log(
        axiosError.response.status, // Print response http status code
        axiosError.response.data,   // Print response content
      )
    }
  })
;


//
// Make GET request with no specific configuration
//
klient.request('/example');
```

&nbsp;

#### get
---

Perform a GET request.

```typescript
get(url: string, config?: KlientRequestConfig | AxiosRequestConfig): Request<AxiosResponse>
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// GET Request with url only
//
klient
  .get('/example')
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;


//
// GET request with specific config
//
klient
  .get('/example', {
    params: {
      test: true
    }
  })
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;
```

&nbsp;

#### post
---

Perform a POST request.

```typescript
post(url: string, data: any, config?: KlientRequestConfig | AxiosRequestConfig): Request<AxiosResponse>
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// POST request containing data
//
klient
  .post('/posts', { title: '...', content: '...' })
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;
```

&nbsp;

#### put
---

Perform a PUT request.

```typescript
put(url: string, data: any, config?: KlientRequestConfig | AxiosRequestConfig): Request<AxiosResponse>
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// PUT request containing data
//
klient
  .put('/posts', { title: '...', content: '...' })
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;
```

&nbsp;

#### patch
---

Perform a PATCH request.

```typescript
patch(url: string, data: any, config?: KlientRequestConfig | AxiosRequestConfig): Request<AxiosResponse>
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// PATCH request containing data
//
klient
  .patch('/posts/1', { title: '...' })
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;
```

&nbsp;

#### delete
---

Perform a DELETE request.

```typescript
delete(url: string, config?: KlientRequestConfig | AxiosRequestConfig): Request<AxiosResponse>
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// DELETE Request with url only
//
klient
  .delete('/posts/1')
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;


//
// DELETE request with specific config
//
klient
  .delete('/posts/1', {
    params: {
      test: true
    }
  })
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;
```

&nbsp;

#### head
---

Perform an HEAD request.

```typescript
head(url: string, config?: KlientRequestConfig | AxiosRequestConfig): Request<AxiosResponse>
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// HEAD Request with url only
//
klient
  .head('/posts/1')
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;


//
// HEAD request with specific config
//
klient
  .head('/posts/1', {
    params: {
      test: true
    }
  })
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;
```

&nbsp;

#### options
---

Perform an OPTIONS request.

```typescript
options(url: string, config?: KlientRequestConfig | AxiosRequestConfig): Request<AxiosResponse>
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// OPTIONS Request with url only
//
klient
  .options('/posts/1')
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;


//
// OPTIONS request with specific config
//
klient
  .options('/posts/1', {
    params: {
      test: true
    }
  })
  .then(axiosResponse => {
    // ...
  })
  .catch(axiosError => {
    // ...
  })
;
```

&nbsp;

#### file
---

Fetch file on server and transform it to Blob instance.

```typescript
file(urlOrConfig: string | KlientRequestConfig | AxiosRequestConfig): Promise<Blob>
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// File requests is flag as "file" action
//
klient.on('request', e => {
  if (e.context.action === 'file') {
    // ...
  }
});


//
// Fetch file https://api.example.com/v1/example.pdf
//
klient
  .file('example.pdf')
  .then(blob => {
    console.log(blob);
  })
  .catch(axiosError => {
    // ...
  })
;


//
// Precise whole url for by passing baseURL
//
klient
  .file({ url: 'https://api.example.com/documents/example.pdf' })
  .then(blob => {
    console.log(blob);
  })
  .catch(axiosError => {
    // ...
  })
;
```

&nbsp;

#### on
---

Listen a specific event.

```typescript
on(
  event: string,                                   // The event alias
  callback: (e: Event) => Promise<void> | void,    // The callback invoked on dispatch
  priority: number = 0,                            // Priority of callback
  once: boolean = false                            // Is once callback - use once method instead defining true
): Klient
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// Declare listeners
//
const requestEventListener = e => {...};
const requestEventListenerBis = e => {...};
const requestDoneEventListener = e => {...};


//
// Register listeners
//
klient
  .on('request', requestEventListener)
  // This listener will be called before previous one
  // because its priority is higher
  .on('request', requestEventListenerBis, 2)
  .on('request:done', requestDoneEventListener)
;
```

&nbsp;

#### once
---

Listen a specific event, once.

```typescript
once(
  event: string,                                   // The event alias
  callback: (e: Event) => Promise<void> | void,    // The callback invoked on dispatch
  priority: number = 0                             // Priority of callback
): Klient
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// Declare listeners
//
const requestEventListener = e => {...};
const requestDoneEventListener = e => {...};


//
// Register listeners callable once time
//
klient
  .once('request', requestEventListener)
  .once('request:done', requestDoneEventListener)
;
```

&nbsp;

#### off
---

Unset a listener

```typescript
off(
  event: string,                                   // The event alias
  callback: (e: Event) => Promise<void> | void,    // The callback invoked on dispatch
): Klient
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// Declare listener
//
const requestEventListener = e => {...};


//
// Register listener
//
klient.on('request', requestEventListener);


//
// Unregister listener
//
klient.off('request', requestEventListener);
```

&nbsp;

#### load
---

Manually load extensions after klient instance construction (see [Extensions](#extensions)).

```typescript
load(extensions: string[] | undefined): Klient
```

*Example*

```js
import Klient, { Extensions } from '@klient/core';

//
// Create an extension
//
const extension = {
  name: '@klient/example',
  initialize: klient => {
    // Add features
    klient.services.set('test', {
      customMethod: true
    })
  }
}


//
// Register the extension
//
Extensions.push(extension);


//
// Build Klient instance
//
const klient = new Klient({
  url: 'https://api.example.com/v1',

  // Do not load extensions at instance construction
  extensions: [],
  
  // Specify extensions to load at instance construction
  // extensions: ['@klient/example'],

  // Load all extensions at instance construction
  // extensions: undefined,
});


//
// Load manually specific extensions
//
klient.load(['@klient/example']);


//
// Use features of your extension
//
klient.services.get('test').customMethod(); // Return true
```

&nbsp;

#### extends
---

Add new  method or property to a created klient instance.

```typescript
extends(property: string, value: any, writable: boolean = false): Klient
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// Create a counter for the example
//
klient
  .extends('counter', 0)
  .extends('increment', () => {
    klient.customCounter += 1;
    return klient;
  }, false)
;


//
// Use the counter
//
console.log(klient.increment().counter); // Print 1
```

&nbsp;

#### cancelPendingRequests
---

Cancel all requests created by factory by calling Request.cancel method of pending requests.
The requests will be cancelled by Axios at execution step. The request cannot be cancelled after Axios execution.
Cancelling a request will reject the Request Promise, so you need to check it in catch block.

```typescript
cancelPendingRequests(): Klient
```

*Example*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// Make an http requests
//
klient
  .request('/posts')
  .catch(e => {
    if (klient.isCancel(e)) {
      // ...
    }
  })
;

klient
  .request('/foos')
  .catch(e => {
    if (klient.isCancel(e)) {
      // ...
    }
  })
;


//
// Cancel pending requests
//
klient.cancelPendingRequests();
```

&nbsp;

## Events

Events allow listeners to perform actions on objects like request. By default, only request events are emitted.

### Listeners

These are caracteristics of a listeners :

- A listener i a callback attached to an uniq event.
- All listeners attached to an event will be invoked in order of their priorities.
- A listener can return a Promise to perfom an async actions, but it will suspend the dispatch process untill the returned Promise isn't fullfilled.
- A listener is considerated as failed if an error is thrown or if a rejected Promise is returned.
- A listener can stop the dispatch propagation of the event by using `event.stopPropagation()`, so the listeners with lower priorities will be skipped.

*Note that the dispatch process purposes 2 different strategies : "abort on listener failure" OR "ignore listeners failures" (See [Dispatch events](#dispatch-events))*

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// Register a listener on request event with no priority
//
klient.on('request', e => {...});


//
// This listener will be invoked before previous one because its priority is higher.
// As the listener is returning a Promise, this will suspend the dispatch process.
// The previous listener will be called only after this listener treatment.
//
klient.on('request', e => {
  // Simulate an async process
  return new Promise(resolve => {
    // The next listener will be executed only after 3 seconds
    setTimeout(resolve, 3000);
  });
}, 2);


//
// This listener will stop propagation, listeners with priority lower than "1" won't be invoked 
// So, for a file request, the first listener declared will be skipped.
//
klient.on('request', e => {
  if (e.context.action === 'file') {
    // If e.stopPropagation is called, listeners with lower priority won't be invoked
    e.stopPropagation();

    // If e.skipNextListeners is called, the next X listeners won't be invoked
    // e.skipNextListeners(2);

    // If e.skipToListener is called, the next listeners won't be invoked
    // untill listener with defined id 
    // e.skipUntilListener(5);
  }
}, 1);


//
// Register listeners on many events
//
klient.on('request:success', e => {...});
klient.on('request:error', e => {...});
klient.on('request:done', e => {...});


//
// The first declared listener won't be invoked
//
klient.file('/robots.txt');
```

### Workflow

When a request will be executed, "request" events are dispatched in a specific order describe below : 

```
const klient = new Klient('http://example.com');

klient
  .request('/workflow')
    |
    |
   (1)───[ Dispatch "request" Event ]
    |
    |    This event allows listeners edit/finalize request config.
    |    For example, a listener can append an auth token in headers.
    |    This event is dispatch with "abort on listener failure" strategy,
    |    so, if a listener failed on this event, request will be rejected.
    |
    |
   (2)───[ Execute request with Axios ]
    |
    |
   (3)─────────[ OPTIONAL : Dispatch "request:cancel" Event ]
    |
    |          If the request cancel method has been called before/during axios execution,
    |          the request will be rejected with an AxiosCancelledError.
    |
    |
    |
    |─── At this point, the request has been executed with Axios
    |    and the result is available.
    |
    |
   (4)───[ Dispatch "request:success" OR "request:error" Event ]
    |
    |    Theses events give access to request hydrated with the Axios result.
    |
    |
    |
   (5)───[ Dispatch "request:done" Event ]
    |
    |    It's the last event emitted on every request, dispatched whenever the result type.
    |
    |
    |
   (6)───[ Request promise is fulfilled as Axios does ]
    |
    |
   .then(axiosResponse => {...})
   .catch(axiosError => {...})
   .finally(() => {...})
;
```

### RequestEvent

> alias = `request`

The request event is dispatched with abortOnFailure strategy on, so if a listener failed, the request will be rejected.

**Properties**

| Name    | Type                  | Description                  |
|---------|-----------------------|------------------------------|
| request | `Request`             | The current request object.  |
| config  | `AxiosRequestConfig`  | Get current request config.  |
| action  | `string \| undefined` | Get current request action.  |
| context | `object`              | Get current request context. |


### RequestSuccessEvent

> alias = `request:success`

The RequestSuccessEvent is emitted after Axios execution (in success case). It allows to access AxiosResponse.

**Properties**

*All properties of RequestEvent are also available.*

| Name         | Type                 | Description                                               |
|--------------|----------------------|-----------------------------------------------------------|
| relatedEvent | `RequestEvent`       | The RequestEvent instance emitted before Axios execution. |
| response     | `AxiosResponse`      | The current response object.                              |
| data         | `AxiosResponse.data` | The current response data.                                |

### RequestErrorEvent

> alias = `request:error`

The RequestErrorEvent is emitted after Axios execution (in failure case). It allows to access AxiosError.

**Properties**

*All properties of RequestEvent are also available.*

| Name         | Type                       | Description                                                                                      |
|--------------|----------------------------|--------------------------------------------------------------------------------------------------|
| relatedEvent | `RequestEvent`             | The RequestEvent instance emitted before Axios execution.                                        |
| error        | `AxiosError \| Error`      | The current error object.                                                                        |
| response     | `AxiosError.response`      | The current error response object (available only if Axios failed for an invalid response code). |
| data         | `AxiosError.response.data` | The current error response data.                                                                 |

### RequestDoneEvent

> alias = `request:done`

The RequestDoneEvent is emitted just after RequestSuccessEvent or RequestErrorEvent.

**Properties**

*All properties of RequestEvent are also available.*

| Name         | Type                                             | Description                              |
|--------------|--------------------------------------------------|------------------------------------------|
| relatedEvent | `RequestSuccessEvent \| RequestErrorEvent`       | The event dispatched before this one.    |
| result       | `AxiosResponse \| AxiosError \| Error`           | Get request result.                      |
| success      | `boolean`                                        | Check if result is an instance of Error. |
| data         | `AxiosResponse.data \| AxiosError.response.data` |                                          |

### RequestCancelEvent

> alias = `request:cancel`

The RequestCancelEvent is emitted when the request cancel method is called.

**Properties**

*All properties of RequestEvent are also available.*

| Name         | Type                 | Description                              |
|--------------|----------------------|------------------------------------------|
| relatedEvent | `RequestEvent`       | The event dispatched before this one.    |


### Dispatch events

```js
import Klient, { Event } from '@klient/core';

//
// Create custom event class extending of base Event class
//
class CustomEvent extends Event {
  // The event name can be used to listen it
  static NAME = 'custom-event';

  constructor(relatedObject) {
    this.relatedObject = relatedObject;
  }
}


//
// Build Klient instance
//
const klient = new Klient('...');


//
// Register a listener for the custom event
//
klient.on('custom-event', e => {
  console.log(e.relatedObject.test); // Print true
});


//
// Create instance of the custom event in order to dispatch it
//
const event = new CustomEvent({ test: true });


//
// Dispatch your event with strategy "abort when listener failed"
//
klient.dispatcher.dispatch(event);


//
// Dispatch your event with strategy "ignore listeners failures"
//
klient.dispatcher.dispatch(event, false);
```

## Services

A service is an object instance containing usable functions callable everywhere in your code.

```js
import Klient from '@klient/core';
import CustomEvent from './event';

//
// Create a custom service
//
class Security {
  constructor(klient) {
    this.klient = klient;

    // Listen events
    klient.on('request', e => {
      // Do something
    });
  }

  dispatchCustomEvent() {
    // Access services
    this.klient.dispatcher.dispatch(new CustomEvent(), false);
  }
}


//
// Build Klient instance
//
const klient = new Klient('...');


//
// Instanciate your custom service class
//
const security = new Security(klient);


//
// Set service in services storage
//
klient.services.set('security', security);


//
// Use your custom service
//
klient.services.get('security').dispatchCustomEvent();
```

## Extensions

Extensions are used to add features and reuse a maximum of produced code.

### Create an extension

The extensions can be registered to registry by using Extensions.push method.
When new klient instance is built, by default all registered extensions are loaded, else it's possible to define specific extensions to load.

```js
import Klient, { Extensions } from '@klient/core';

//
// Create an extension needs only a name & an initializer
//
const extension = {
  name: '@klient/example',
  initialize: klient => {
    // Add a service, features, ...
    klient.services.set('test', {
      customMethod: true
    })
  }
}

//
// Register your extension in registry
//
Extensions.push(extension);


//
// Build Klient instance
//
const klient = new Klient('...');


//
// At this point the extension has been automatically loaded
//
klient.services.get('test').customMethod(); // Return true
```

### Share an extension

```js
//
// In your main file "index.js"
//

import { Extensions } from '@klient/core';

const extension = {
  name: '@klient/rest',
  initialize: klient => {
    // ...
  }
};

extensions.push(extension);

export default extension;
```

### Used a shared extension

The following code show you how to load an extension build like describe in previous section.

```js
import Klient from '@klient/core';

//
// Auto registration of extension in registry by importing index.js
//
import '@klient/rest';


//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// See loaded extensions
//
console.log(klient.extensions); // Print ['rest']


//
// Use extension features
//
klient.register('User', '/users');
```

## Request

### Cancel

The cancel method uses the "abortController" of Axios config. The request can be cancelled only on axios execution step. The cancellation will reject your promise as axios does.

```js
import axios from 'axios';
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// Perform a request
//
const request = klient.request({ url: '/test' })
  .then(() => {...})
  .catch(e => {
    if (klient.isCancel(e)) {
      return;
    }

    // ...
  })
;


//
// Cancel a single pending request
//
request.cancel();


//
// Cancel all pending requests
//
klient.cancelPendingRequests();
```

### Resolve/Reject manually

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// Request can be resolved with an AxiosResponse from a listener callback
//
klient.on('request', e => {
  return e.request.resolve({
    status: 200,
    data: {
      success: true
    },
  });
});


//
// Request can be rejected with an Error instance
//
klient.on('request', e => {
  return e.request.reject(new Error('...'));
});


//
// Create manually a execution timeout, just for the example
//
setTimeout(async () => {
  if (!request.result) {
    await request.reject(new Error('Too long'));
  }
}, 1500);


//
// Perform an http request
//
klient.request({ url: '/test' });
```

By default the request handler is Axios, but you can replace it by your own handler :

```js
klient.on('request', e => {
  // Axios will be replace for this request by our custom handler
  e.request.handler = (config) => {
    // Reject
    // return Promise.reject(new Error('Too long'))

    // Resolve
    return Promise.resolve({
      status: 200,
      data: {
        success: true
      },
    });
  };
});
```

### Execute request manually

Sometimes you want to prepare a request object for executing it later.

```js
import Klient from '@klient/core';

//
// Build Klient instance
//
const klient = new Klient('https://api.example.com/v1');


//
// At this step, request is a Promise object but the request process is not started
//
const request = klient.factory.createRequest({ url: '/test' });


//
// Call "execute" method starts the request process
//
request
  .execute()
  .then(...)
  .catch(...)
;
```

## Debug

The Klient debug mode allows you to inspect dispatch process. If debug mode is enabled, the dispatcher will dispatch special event name "debug" with information about current action.

```js
import Klient from '@klient/core';

//
// Build Klient instance with debug mode enabled
//
const klient = new Klient({ debug: true });


//
// Listen for dispatch logs
//
klient.on('debug', (e) => {
  switch (e.action) {
    // Dispatch is starting
    case 'start':
      console.log(
        e.event,    // Print current event object
        e.handler,  // Print listeners array
      );
      break;
    // Dispatcher will invoke a listener
    case 'invoking':
      console.log(
        e.event,    // Print current event object
        e.handler,  // Print listener
      );
      break;
    // Dispatcher has invoked listener successfully
    case 'invoked':
      console.log(
        e.event,    // Print current event object
        e.handler,  // Print invoked listener
      );
      break;
    // Dispatcher detects event.stopPropagation() called
    case 'stopped':
      console.log(
        e.event,    // Print current event object
        e.handler,  // Print listener whose stop process
      );
      break;
    // Dispatch failed because of "abort on listener failure"
    case 'failed':
      console.log(
        e.event,    // Print current event object
        e.handler,  // Print listener whose failed
        e.error,    // Print detected error
      );
      break;
    case 'end':
      console.log(
        e.event,    // Print current event object
        e.handler,  // Print invoked listeners array
      );
      break;
  }
});
```
