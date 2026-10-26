@api @books @integration-test @regression
Feature: Book Catalog Management (Full REST API CRUD)
  As an authenticated BookStore administrator
  I want to perform CRUD operations on books via REST API
  In order to maintain a consistent catalog inventory

  Background:
    Given the user is authenticated as an admin in the API

  @integration-test @functional @positive-testing @contract @smoke @p1
  Scenario: Retrieve books catalog and verify initial seed books
    When the user requests all books from the API
    Then the API response status code should be 200
    And the response should match the "BookList" contract
    And the books list should contain at least 5 books

  @integration-test @functional @positive-testing @contract @equivalence-partitioning @smoke @p1
  Scenario: Successfully create a book with valid complete payload
    When the user creates a new book via API with the following data:
      | title                   | author        | isbn          | price | category |
      | Architecture with Kafka | Sergio Cañete | 9780132350884 | 45.50 | Tech     |
    Then the API response status code should be 201
    And the response should match the "Book" contract
    And the created book should match the submitted payload

  @integration-test @functional @positive-testing @negative-testing @state-transition @contract @reliability @p1
  Scenario: Full entity lifecycle: Create, Retrieve by ID, Update and Delete
    Given a book is created via API with random valid data
    And the API response status code should be 201
    When the user retrieves the book by its newly created id
    Then the API response status code should be 200
    And the response should match the "Book" contract
    When the user updates the price of the newly created book to 89.99
    Then the API response status code should be 200
    And the retrieved book price should be 89.99
    When the user deletes the newly created book
    Then the API response status code should be 200
    When the user attempts to delete the same already deleted book
    Then the API response status code should be 404

