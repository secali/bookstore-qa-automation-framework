@ui @atomic @generic @system-test @regression
Feature: Page-Agnostic UI Interaction via Atomic Puzzle Pieces
  As an SDET Automation Engineer
  I want to orchestrate UI test journeys specifying target pages and element identifiers
  In order to validate any page, form, modal or table without writing new Page Objects or locators

  @system-test @functional @positive-testing @state-transition @usability @atomic @generic @smoke @p1
  Scenario: Full user journey: Navigation, modal form submission, and table row deletion
    Given the user opens the "Books" page with preloaded API session
    Then the current URL should contain "/books"
    When the user clicks the "Add Book" button
    Then the modal should be visible
    When in the active modal, the user enters "The Art of Atomic Automation" into the "title" field
    And in the active modal, the user enters "Sergio Cañete" into the "author" field
    And in the active modal, the user enters "9788424115549" into the "isbn" field
    And in the active modal, the user enters "35.00" into the "price" field
    And in the active modal, the user clicks the "Save" button
    Then the modal should not be visible
    And in the table, the row containing "The Art of Atomic Automation" should be visible
    When in the table, the user finds the row containing "The Art of Atomic Automation" and clicks the "Delete" button
    Then the modal should be visible
    When in the active modal, the user clicks the "Confirm" button
    Then the modal should not be visible
    And in the table, the row containing "The Art of Atomic Automation" should not be visible

