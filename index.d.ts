type WebSocketMessage = Object | string
type WebSocketCtor = { new(url: string, protocols?: (string | string[] | undefined)): WebSocket }
type RequestHandler = (message: WebSocketMessage) => WebSocketMessage | undefined
type ValueOrGetter<T> = T | (() => T)

declare namespace Cypress {
  interface Chainable<Subject = any> {
    mockWebSocket: (url: string, connectionResponseMessage?: WebSocketMessage) => Chainable<Element>
    triggerSocketEvent: (message: ValueOrGetter<WebSocketMessage>) => Chainable<Element>
    triggerSocketEvents: (messages: ValueOrGetter<WebSocketMessage[]>) => Chainable<Element>
    registerSocketRequestResponse: (request: WebSocketMessage, response: WebSocketMessage) => Chainable<Element>
    registerSocketRequestHandler: (handler: RequestHandler) => Chainable<Element>
  }
}
