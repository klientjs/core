# Klient

![badge-coverage](.github/badges/coverage.svg)

- [Table of content](./doc/0.TOC.md)
- **Introduction** (Current)
  * [Concept](#concept)
  * [Requirements](#requirements)
  * [Installation](#installation)
  * [AIO Example](#all-in-one-example)
- [Usage](./doc/1.Usage.md)
- [Events](./doc/2.Events.md)
- [Request](./doc/3.Request.md)
- [Extensions](./doc/4.Extensions.md)
- [Utilities](./doc/5.Utilities.md)
- [API](./doc/6.API.md)

---

## Introduction

### Concept

Klient is a very light weight library able to build any kind of http client. It's wrapping the amazing [Axios](https://github.com/axios/axios) library for executing requests. Klient purposes to emit events before and after a request execution, whose allows to customize request or perform action in specific moment of request lifecycle.

During an event propagation, the listeners are called one by one sorted by their own defined priority. They can access to current request, the current response or eventual errors. In specific cases, a listener can also suspend temporary the request process to realize an async task (for exemple, to refresh credentials).

Klient is modulable by using extensions, parameters and services, a way to reuse features across all of your projects. Fully configurable, Klient is perfect to build the most adapted client for your target webservice.

**Why should I use Klient ?**

  - I need to make http requests on my website or in a node project

  - I need a way to make my http requests evolutive

  - I want to work on my front project but the target webservice is not ready yet

  - I love to enable many features by using extensions simply

  - I want to produce readable and reusable code

  - My project is using Typescript

See below the list of official extensions, useful to configure a Klient instance quickly :

| Name                                                | Description                                      | Available  |
|-----------------------------------------------------|--------------------------------------------------|------------|
| [@klient/jwt](https://github.com/klientjs/jwt)      | Manage requests authentication with JWT          |     ✅     |
| [@klient/rest](https://github.com/klientjs/rest)    | Consume REST APIs                                |     ✅     |
| [@klient/mock](https://github.com/klientjs/mock)    | Mock responses of defined requests               |     ✅     |
| @klient/cache                                       | Limit api calls by caching responses             |     ❌     |
| @klient/offline                                     | Purpose an offline mode                          |     ❌     |
| @klient/graphql                                     | Perform graphql queries                          |     ❌     |
| @klient/soap                                        | Consume SOAP APIs                                |     ❌     |

### Requirements

- [Node](https://nodejs.org/) >= v12


### Installation

Install core package with your favorite package manager :

```shell
# As axios is many used, we recommand you to install it in your dependencies
# to avoid reference conflict between multiple version used by node_modules packages
# npm install axios@0

# With NPM
$ npm install klient/core

# With YARN
$ yarn add @klient/core
```


### All in one example

**[You can also refer to official example project](https://github.com/klientjs/example) of Klient packages, used in a web project based on React which consumes a fully mocked REST API**

```js
import Klient from '@klient/core';

//
// Import practical extensions we will use
//
import '@klient/rest';
import '@klient/jwt';



//
// -> @klient/core : Execute listenable HTTP Request
//

//
// We need to configure a Klient instance for the target webservice
// The klient object will representing like an "SDK" of your API
// Usually we will need one Klient instance per host to consume
//
const klient = new Klient({
  url: 'http://example.rest/api',                   // Target host
  debug: true,                                      // Debug mode
  extensions: ['@klient/jwt', '@klient/rest'],      // Optionally specify extensions to load
  request: {                                        // Static Axios request config for every request
    headers: {
      'Content-Type': 'application/json',
    }
  }
});


//
// Listen for requests made with a klient instance
// 'request' event is dispatched before request execution
//
klient.on('request', event => {
  console.log(
    event.request,  // Request Promise object
    event.config,   // Axios request config
    event.context,  // Request context
  );

  // For example, customize request config by appending an header to all requests
  event.config.headers.RequestedWith = 'Klient';
});

//
// Listen for other events
//
// klient.on('request:success', e => {...});   // After execution in success case   (contains response)
// klient.on('request:error', e => {...});     // After execution in failure case   (contains error)
// klient.on('request:done', e => {...});      // Last event dispatched             (contains result)


//
// Execute requests in same way as you do with Axios instance (will invoke listeners !)
//
klient
  .request({
    url: '/posts',
    method: 'GET',
    context: {                   // context is special key usable by listeners
      someCustomValue: '...'     // where you can define any useful value
    }
  })
  .then(axiosResponse => {
    console.log(
      axiosResponse.data,    // Get response content
      axiosResponse.status,  // Get response status
      // ...
      // Please refer to Axios documentation for more details
    );
  })
  .catch(axiosError => {
    console.log(
      axiosError.response,  // Get Response
      axiosError.request,   // Get Request configuration
      // ...
      // Please refer to Axios documentation for more details
    );
  })
;

//
// Others useful request methods (see Klient API for more details)
//
// klient.get('/posts');
// klient.post('/posts', { title: 'How to win 150K $ in 5 minutes' });
// klient.put('/posts/1', { title: 'Who would win between a lion and a tiger' });
// klient.delete('/posts/1');
//
// ... + all verbs provided by Axios API (head, options, ...)

//
// Special method for retrieving server file as Blob object
//
klient.file('/medias/pie_recipe.pdf').then(blob => {
  // Make user download file ?
});



//
// -> @klient/rest : Configure "resource" for consuming REST API
//

//
// Step 1 - Register a resource
//
// We will register a "Resource", usable after as a service. It will be the "repository" of a single resource in API.
// By default, it allows to you to perform create|read|list|update|delete actions according to REST principles.
//
klient.register('Post', '/posts');


//
// Step 2 - Call any resource CRUD action, automatically configured. Don't reinvent the wheel...
//
klient
  .resource('Post')
  .create({
    title: 'My first post',
    description: 'Not in the mood, I should ask Chat GPT to handle this part...'
  })
  .then((responseData) => {
    // Hide a form, show a success message, redirect user, sell data to China ? 
  })
  .catch((axiosError) => {
    // Display an error, handle validation error, tell the user it is his fault ? 
  })
;


//
// Optionally listen for request executed with a Resource instance
//
klient.on('request', event => {
  const { action, rest, resource } = event.context;

  if (action === 'create' && rest === true && resource === 'Post') {
    // A Post is going to be created
  }
});


//
// -> Add custom actions for some resources ? No Problemo !
//

//
// Step 1 - Create a resource class
//
// A Resource is a service usable anywhere in your code, supposed to manage a single resource in API
// It can be considerated as a "repository". The "Resource" class contains the default create|read|list|update|delete methods.
//
import { Resource } from '@klient/rest';

class PostResource extends Resource {
  constructor() {
    // Alias, entrypoint
    super('Post', '/posts');
  }

  //
  // Defines as many methods you need in your resource
  //
  enable(itemOrId, enable = true) {
    return this.request({                     // This method returns a Promise fulfilled with Response.data result
      url: this.uri(itemOrId, 'enable'),      // Build the entrypoint uri like /posts/<id>/enable
      data: { enable },                       // Request body content
      method: 'PUT',                          // The expected method
      context: {                              // Set context values usable by listeners
        action: 'enable'
      }
    });
  }
}


//
// Step 2 - Register your custom resource
//
klient.register(new PostResource());


//
// Step 3 - just call any custom action defined in your Resource class
//
klient
  .resource('Post')
  .enable('...')
  .then(() => {
    console.log('We enabled the post !');
  })
;



//
// -> @klient/jwt : Authenticate your request with JWT
//

//
// Step 1 - Configure request made for authentication
//
// Please refer to @klient/jwt documentation for more details
//
klient.parameters.set('jwt', {
  // Configure token entrypoint (can be fully overrided using "map" and "configure" option)
  login: {
    url: '/auth',
    method: 'POST',
  },
  // Configure refresh token entrypoint (optional) (can be fully overrided as login)
  refresh: {
    url: '/auth/refresh',
    method: 'POST',
  },
  // Persist authentication state in a cookie (optional)
  storage: {
    type: 'cookie',        // Also available : localStorage | static
    options: {             // See @klient/storage for available options per storage type
      name: 'auth_token',
      path: '/'
    }
  }
});


//
// Step 2 - Optionally listen for JWT events
//
klient
  .on('jwt:authenticate', () => {
    // My user has getting a new token, maybe we should make him appear as logged in my app
  })
  .on('jwt:expired', () => {
    // Oops, credentials has been detected as expired, maybe we should redirect user to login page ?
  })
;


//
// Step 3 - Log the user in!
//
klient
  // Fetch a token with credentials as expected in your API
  .login({ username: '...', password: '...' })
  .then(() => {
    // At this point, the event "jwt:authenticate" has been emitted
    // and every new request will contains the fetched token in header "Authorization"
    // Tt will be added by a listener (on request event) declared by @klient/jwt extension
    // The automatic request authentication can be disabled by defining context.authenticate to false.
  })
;


//
// Step 4 - Automatically execute authenticated request
//
// The request config will be hydrated as below :
//
// {
//   url: '/private',
//   method: 'GET',
//   headers: {
//     'Authorization': 'Bearer <token>',
//     'Content-Type': 'application/json',
//   }
// }
//
klient
  .get('/private')
  .then(axiosResponse => {
    // Too much posts fetched with so few lines, Mouahaha
  })
  .catch(axiosError => {
    // No way ! My user is certainly authenticated, so what's happening now !?
  })
;
```

---

**[TOC](./doc/0.TOC.md) &emsp; >> &emsp; Introduction &emsp; >> &emsp; [Usage](./doc/1.Usage.md) &emsp; >> &emsp; [Events](./doc/2.Events.md) &emsp; >> &emsp; [Request](./doc/3.Request.md) &emsp; >> &emsp; [Extensions](./doc/4.Extensions.md) &emsp; >> &emsp; [Utilities](./doc/5.Utilities.md) &emsp; >> &emsp; [API](./doc/6.API.md)**

---
