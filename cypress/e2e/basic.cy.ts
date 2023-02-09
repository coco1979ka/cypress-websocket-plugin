describe('Basic websocket tests', () => {

  it('can receive server events', () => {
    cy.mockWebSocket('ws://cypress-websocket/ws')
    cy.visit('/')
    cy.contains('Cypress Websocket Plugin')
    cy.triggerSocketEvent({type: 'event', payload: "First Event"})
    cy.get('pre').contains('First Event')
  })

  it("can receive initial message", () => {
    cy.mockWebSocket('ws://cypress-websocket/ws', {type: 'connected', payload: 'Hello from Cypress'})
    cy.visit('/')
    cy.contains('Cypress Websocket Plugin')
    cy.get('pre').contains('Hello from Cypress')
  })

  it("can mock request response", () => {
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
  })
})