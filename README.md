# Cypress Websocket Plugin

Mock websocket requests in a cypress intercept style.

[![semantic-release: conventionalcommits](https://img.shields.io/badge/semantic--release-conventionalcommits-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/coco1979ka/cypress-websocket-plugin/publish-plugin.yml)
![npm](https://img.shields.io/npm/v/cypress-mock-websocket-plugin)

The plugin allows you to write a test like:

```typescript
const request = { type: 'request', payload: 'PING' }
const response = { type: 'response', payload: 'PONG'}

cy.mockWebSocket('ws://cypress-websocket/ws')
  .registerSocketRequestResponse(request, response)
  .visit('/')
  .contains('Cypress Websocket Plugin')
  .get('button')
  .click()
  .get('pre')
  .contains('PONG')
```


## Usage

The plugin is known to work with rxjs web sockets and GraphQL Apollo client. 
It's **recommended** that you can bypass the default web socket constructor, but you can 
also use the browser's native web socket implementation (see below).

### Setup

Import this plugin by adding it to the `commands.ts` file:

```typescript
// cypress/support/commands.ts
import 'cypress-mock-websocket-plugin';
```

Here's an example how it will work with rxjs:

```typescript
const isRunningInCypress = () =>
  !!window.Cypress

const getWebSocketCtor = () =>
  isRunningInCypress()
    ? window.MockedWebSocket
    : window.WebSocket

const webSocket$ = webSocket({
  url: 'ws://cypress-websocket/ws',
  WebSocketCtor: getWebSocketCtor(),
})
```

In your Cypress tests, mock the web socket **before** you call visit:

```typescript
cy.mockWebSocket('ws://cypress-websocket/ws')
  .visit('/')
```

### Changing the default web socket constructor
If for some reasons you want to use a different WebSocketCtor name than the default `window.MockedWebSocket` from
the example, you can now change the name of the constructor:

```typescript
cy.mockWebSocket('ws://cypress-websocket/ws', { webSocketCtorName: 'MyWebSocket' })
```

### Native Web Socket API
It's now possible to use the browser's native WebSocket API. Because Cypress uses WebSockets for internal
communication, you have to explicitly turn on the option for native web sockets:

```typescript
cy.mockWebSocket('ws://cypress-websocket/ws', { useNative: true })
```

### Initial response

---
**⚠️ BREAKING CHANGE**

The initial response must be moved to the options object.

---


If you need to mock an initial response, you can do it like this:

```typescript
const initialResponse = { type: 'response', payload: 'INITIAL' }
cy.mockWebSocket('ws://cypress-websocket/ws', { connectionResponseMessage: initialResponse })
```

### Mocking interactions (request/response style)

Mocking with static request and response:

```typescript
const request = { type: 'request', payload: 'PING' }
const response = { type: 'response', payload: 'PONG'}

cy.mockWebSocket('ws://cypress-websocket/ws')
  .registerSocketRequestResponse(request, response)
```

If you have any fields dynamically generated by the client, e.g. access tokens,
you can simply skip those properties in the request object. The plugin will partially match
the expected and actual request.

Example:

```typescript
// provide this to the cy.registerSocketRequestResponse
const expectedRequest = { 
  type: 'request', 
  payload: {
    content: 'Some content to match'
  }
}

// and it will match when client sends the following request:
const actualRequest = {
  type: 'request',
  payload: {
    accessToken: 'abc12345',
    content: 'Some content to match'
  }
}
```

The plugin uses a library called `ts-pattern` in order to match the requests.

If you need more control to match the request, you can pass a request handler instead
of using a request object:

```typescript
cy.registerSocketRequestResponse((request) => {
  //implement your logic to match the request here and return the mocked response
  return {
    type: 'response',
    payload: 'your payload'
  }
})
```

### Mocking server events

In order to mock server events, you can simply trigger a server event like this:

```typescript
cy.mockWebSocket('ws://cypress-websocket/ws')
  .visit('/')
  .contains('Cypress Websocket Plugin')
  .triggerSocketEvent({type: 'event', payload: "First Event"})
  .get('pre').contains('First Event')
```

Or, if you need more control (e.g. you need to provide a context specified in a previous interaction):

```typescript
const correlationId = 1234
cy.mockWebSocket('ws://cypress-websocket/ws')
  .visit('/')
  .triggerSocketEvent(() => { return { type: 'event', payload: correlationId }})
  .get('pre').contains(correlationId)
```

## Known Issues

In React 18, if you're using strict mode the `useEffect` hook is called twice,
which does not work with the current implementation. You either have to deactivate
strict mode in your tests, or you have to initialize the web socket outside of
`useEffect`

## Dependencies
This plugin was built using the following libraries:

- Mock Socket https://github.com/thoov/mock-socket
- ts-pattern https://github.com/gvergnaud/ts-pattern

## Contributions
Any contributions are welcome. Feel free to open a ticket or create
a pull request.
