describe('Test lazy evaluation', () => {

  it('should evaluate lazily', () => {
    const context = 'My Context'
    cy.mockWebSocket('ws://cypress-websocket/ws')
      .visit('/')
      .contains('Cypress Websocket Plugin')
      .triggerSocketEvent(() => { return { type: 'event', payload: context }})
      .get('pre').contains(context)
  })
})