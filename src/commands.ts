import * as Promise from 'cypress/types/bluebird'
import { Client, Server, WebSocket } from 'mock-socket'
import { isMatching } from 'ts-pattern'

interface RequestResponse {
  request: WebSocketMessage
  response: WebSocketMessage
}

let socketPromise: Promise<Client> = null
let mockServer = null
let requestResponses: RequestResponse[] = []
let requestHandlers: RequestHandler[] = []

const extractValue = <T> (value: ValueOrGetter<T>) => typeof value === 'function'
    ? (value as (() => T))()
    : value

const isObject = (message: WebSocketMessage): message is object => typeof (message) === 'object' && message != null

const matches = (request: WebSocketMessage, message: string): boolean => {
  if (isObject(request)) {
    const matchesRequest = isMatching(request)
    const actual = JSON.parse(message)
    return matchesRequest(actual)
  } else {
    return (request as string) === message
  }
}

function sendMessage(socket, message: WebSocketMessage) {
  socket.send(JSON.stringify(message))
}

const getServer = (url: string, connectionResponseData?: WebSocketMessage): Promise<Client> => {
  return new Cypress.Promise(resolve => {
    if (mockServer) {
      console.log("Close existing server")
      mockServer.close()
    }

    mockServer = new Server(url, {mock: false})
    mockServer.on('connection', (socket) => {
      console.log('Connected')
      if (connectionResponseData) {
        sendMessage(socket, connectionResponseData)
      }

      socket.on('message', (message) => {
        for(const handler of requestHandlers) {
          const response = handler(JSON.parse(message))
          console.log('got response from handler', response)
          if(response) {
            sendMessage(socket, response)
            break
          }
        }

        for(const requestResponse of requestResponses) {
          if (matches(requestResponse.request, message)) {
            sendMessage(socket, requestResponse.response)
            break
          }
        }
      })
      resolve(socket)
    })
  })
}


Cypress.Commands.add('mockWebSocket', (url: string, connectionResponseMessage?: WebSocketMessage) => {
  cy.log("Mock Socket: Mocking WebSocket")

  cy.on('window:before:load', win => {
    //@ts-ignore
    win.MockedWebSocket = WebSocket
    socketPromise = getServer(url, connectionResponseMessage)
  })

  cy.on('test:after:run', () => {
    console.log("Mock Socket: Stopping Mock Server")
    mockServer.close()
    requestResponses = []
    requestHandlers = []
  })
})

Cypress.Commands.add('triggerSocketEvent', (message: ValueOrGetter<WebSocketMessage>) => {
  cy.wrap(socketPromise).then((socket: Client) => {
    const extractedMessage = extractValue(message)
    cy.log("Mock Socket: Sending message", extractedMessage)
    socket.send(JSON.stringify(extractedMessage))
  })
})

Cypress.Commands.add('triggerSocketEvents', (messages: ValueOrGetter<WebSocketMessage[]>) => {
  cy.wrap(socketPromise).then((socket: Client) => {
    const extractedMessages = extractValue(messages)
    cy.log("Mock Socket: Sending messages", messages)
    extractedMessages.forEach((message) => {
      socket.send(JSON.stringify(message))
    })
  })
})

Cypress.Commands.add('registerSocketRequestHandler', (handler: RequestHandler) => {
  cy.log('Registering handler')
  requestHandlers.push(handler)
})

Cypress.Commands.add('registerSocketRequestResponse', (request: WebSocketMessage, response: WebSocketMessage) => {
  requestResponses.push({
    request,
    response
  })
})
