/// <reference types="cypress" />
/// <reference types="../../index.d.ts" />

describe('Basic websocket tests', () => {
  it('can receive server events', () => {
    cy.mockWebSocket('ws://cypress-websocket/ws', {
      useDefaultWebSocket: true,
    });
    cy.visit('/native');
    cy.contains('Cypress Websocket Plugin');
    cy.triggerSocketEvent({ type: 'event', payload: 'First Event' });
    cy.get('pre').contains('First Event');
  });

  it('works with custom ctor', () => {
    cy.mockWebSocket('ws://cypress-websocket/ws', {
      webSocketCtorName: 'MockedWebSocket',
    });
    cy.visit('/custom');
    cy.contains('Cypress Websocket Plugin');
    cy.triggerSocketEvent({ type: 'event', payload: 'First Event' });
    cy.get('pre').contains('First Event');
  });

  it('can receive initial message', () => {
    cy.mockWebSocket('ws://cypress-websocket/ws', {
      connectionResponseMessage: {
        type: 'connected',
        payload: 'Hello from Cypress',
      },
      webSocketCtorName: 'MockedWebSocket',
    });
    cy.visit('/custom');
    cy.contains('Cypress Websocket Plugin');
    cy.get('pre').contains('Hello from Cypress');
  });

  it('can mock request response', () => {
    const request = { type: 'request', payload: 'PING' };
    const response = { type: 'response', payload: 'PONG' };
    const secondResponse = { type: 'response', payload: 'PANG' };
    cy.mockWebSocket('ws://cypress-websocket/ws', {
      webSocketCtorName: 'MockedWebSocket',
    })
      .registerSocketRequestResponse(request, response)
      .registerSocketRequestResponse(request, secondResponse)
      .visit('/custom')
      .contains('Cypress Websocket Plugin')
      .get('button')
      .click()
      .get('pre')
      .contains('PONG')
      .contains('PANG');
  });
});
