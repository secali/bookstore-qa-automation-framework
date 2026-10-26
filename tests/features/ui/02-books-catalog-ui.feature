@ui @books @system-test @regression
Feature: Book Catalog Management in Web Dashboard
  As an authenticated administrator
  I want to interact with the books table and modal dialogs
  In order to visually manage the inventory

  Background:
    Given the user opens "/books" with preloaded API session

  @system-test @functional @positive-testing @usability @smoke @p1
  Scenario: Initial table load displays pre-seeded books
    Then the table should display at least 5 rows

  @system-test @functional @positive-testing @state-transition @boundary-value-analysis @usability @p1
  Scenario: Create a book via modal in UI and delete it from the table
    When the user clicks the "Add Book" button
    Then the modal should be visible
    When in the active modal, the user enters "Playwright with TypeScript in Verisure" into the "title" field
    And in the active modal, the user enters "Sergio Cañete" into the "author" field
    And in the active modal, the user enters "9788424115549" into the "isbn" field
    And in the active modal, the user enters "29.99" into the "price" field
    And in the active modal, the user clicks the "Save" button
    Then the modal should not be visible
    And in the table, the row containing "Playwright with TypeScript in Verisure" should be visible
    When in the table, the user finds the row containing "Playwright with TypeScript in Verisure" and clicks the "Delete" button
    Then the modal should be visible
    When in the active modal, the user clicks the "Confirm" button
    Then the modal should not be visible
    And in the table, the row containing "Playwright with TypeScript in Verisure" should not be visible
