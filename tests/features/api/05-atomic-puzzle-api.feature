@api @atomic @lego @regression
Feature: Atomic API Resource Management (Lego Puzzle Pieces)
  As an SDET Automation Engineer
  I want to assemble reusable generic steps as puzzle pieces
  In order to test any entity or endpoint without writing new TypeScript code

  Background:
    Given the user is authenticated as an admin in the API

  @smoke
  Scenario: Create a resource via dynamic JSON payload and retrieve it using stored context variables
    When the user sends a "POST" request to "/books" with JSON payload:
      """
      {
        "title": "{{random_title}}",
        "author": "{{random_name}}",
        "isbn": "{{random_isbn}}",
        "price": 49.99,
        "category": "Architecture"
      }
      """
    Then the API response status code should be 201
    And the response field "title" should not be null or empty
    And the response field "price" should equal the number 49.99
    When the user saves the response field "id" as "createdItemId"
    And the user sends a "GET" request to "/books/{{createdItemId}}"
    Then the API response status code should be 200
    And the response field "id" should equal "{{createdItemId}}"

  Scenario: Update and delete resource using chainable context references
    Given a book is created via API with random valid data
    When the user saves the response field "id" as "targetId"
    And the user sends a "PUT" request to "/books/{{targetId}}" with fields:
      | price | 75.50 |
    Then the API response status code should be 200
    And the response field "price" should equal the number 75.50
    When the user sends a "DELETE" request to "/books/{{targetId}}"
    Then the API response status code should be 200
    When the user sends a "GET" request to "/books/{{targetId}}"
    Then the API response status code should be 404
