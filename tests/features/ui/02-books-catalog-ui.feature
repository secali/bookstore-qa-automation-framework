@ui @books @system-test @regression
Feature: Book Catalog Management in Web Dashboard
  As an authenticated administrator
  I want to interact with the books table and modal dialogs
  In order to visually manage the inventory

  Background:
    Given the user accesses the books dashboard with an active authenticated session

  @system-test @functional @positive-testing @usability @smoke @p1
  Scenario: Initial table load displays pre-seeded books
    Then the books table should display at least 5 rows

  @system-test @functional @positive-testing @state-transition @boundary-value-analysis @usability @p1
  Scenario: Create a book via modal in UI and delete it from the table
    When the user opens the modal and registers a new book with title "Playwright with TypeScript in Verisure", author "Sergio Cañete", isbn "9788424115549" and price 29.99
    Then the books table should display a book with title "Playwright with TypeScript in Verisure"
    When the user deletes the book titled "Playwright with TypeScript in Verisure" from the interface
    Then the book titled "Playwright with TypeScript in Verisure" should no longer appear in the table

