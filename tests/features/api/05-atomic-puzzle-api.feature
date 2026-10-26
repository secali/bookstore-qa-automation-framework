@api @atomic @generic @integration-test @regression
Feature: Atomic API Resource Management (Lego Puzzle Pieces)
  As an SDET Automation Engineer
  I want to assemble reusable generic steps as puzzle pieces
  In order to test any entity or endpoint without writing new TypeScript code

  Background:
    Given the user is authenticated as an admin in the API

  @integration-test @functional @positive-testing @contract @equivalence-partitioning @atomic @generic @smoke @p1
  Scenario: Create a resource via dynamic JSON payload and retrieve it using stored context variables
    Given the user prepares a JSON payload:
      """
      {
        "title": "Base Title",
        "author": "Base Author",
        "isbn": "{{random_isbn}}",
        "price": 10.00,
        "category": "Architecture"
      }
      """
    And the user sets JSONPath "$.title" to "{{random_title}}"
    And the user sets JSONPath "$.price" to the number 49.99
    When the user sends a "POST" request to "/books" with the prepared payload
    Then the API response status code should be 201
    And the response JSONPath "$.title" should not be null or empty
    And the response JSONPath "$.price" should equal the number 49.99
    When the user saves the response JSONPath "$.id" as "createdItemId"
    And the user sends a "GET" request to "/books/{{createdItemId}}"
    Then the API response status code should be 200
    And the response JSONPath "$.id" should equal "{{createdItemId}}"

  @integration-test @functional @positive-testing @negative-testing @state-transition @atomic @generic @reliability @p1
  Scenario: Update and delete resource using chainable context references
    When the user sends a "POST" request to "/books" with body:
      """
      {
        "title": "{{random_title}}",
        "author": "{{random_name}}",
        "isbn": "{{random_isbn}}",
        "price": 30.00,
        "category": "Software"
      }
      """
    Then the API response status code should be 201
    When the user saves the response JSONPath "$.id" as "targetId"
    And the user sends a "PUT" request to "/books/{{targetId}}" with fields:
      | price | 75.50 |
    Then the API response status code should be 200
    And the response JSONPath "$.price" should equal the number 75.50
    When the user sends a "DELETE" request to "/books/{{targetId}}"
    Then the API response status code should be 200
    When the user sends a "GET" request to "/books/{{targetId}}"
    Then the API response status code should be 404
