@api @books @integration-test @regression
Feature: Book Catalog Management (Full REST API CRUD)
  As an authenticated BookStore administrator
  I want to perform CRUD operations on books via REST API
  In order to maintain a consistent catalog inventory

  Background:
    Given the user is authenticated as an admin in the API

  @integration-test @functional @positive-testing @contract @smoke @p1
  Scenario: Retrieve books catalog and verify initial seed books
    When the user sends a "GET" request to "/books"
    Then the API response status code should be 200
    And the response should match the "BookList" contract
    And the response JSONPath "$" should be an array with at least 5 item(s)

  @integration-test @functional @positive-testing @contract @equivalence-partitioning @smoke @p1
  Scenario: Successfully create a book with valid complete payload
    When the user sends a "POST" request to "/books" with body:
      """
      {
        "title": "Architecture with Kafka",
        "author": "Sergio Cañete",
        "isbn": "9780132350884",
        "price": 45.50,
        "category": "Tech"
      }
      """
    Then the API response status code should be 201
    And the response should match the "Book" contract
    And the response JSONPath "$.title" should equal "Architecture with Kafka"
    And the response JSONPath "$.price" should equal the number 45.50

  @integration-test @functional @positive-testing @negative-testing @state-transition @contract @reliability @p1
  Scenario: Full entity lifecycle: Create, Retrieve by ID, Update and Delete
    Given the user prepares a JSON payload:
      """
      {
        "title": "{{random_title}}",
        "author": "Sergio Cañete",
        "isbn": "{{random_isbn}}",
        "price": 50.00,
        "category": "Tech"
      }
      """
    When the user sends a "POST" request to "/books" with the prepared payload
    Then the API response status code should be 201
    When the user saves the response JSONPath "$.id" as "createdId"
    And the user sends a "GET" request to "/books/{{createdId}}"
    Then the API response status code should be 200
    And the response should match the "Book" contract
    When the user sends a "PUT" request to "/books/{{createdId}}" with fields:
      | price | 89.99 |
    Then the API response status code should be 200
    And the response JSONPath "$.price" should equal the number 89.99
    When the user sends a "DELETE" request to "/books/{{createdId}}"
    Then the API response status code should be 200
    When the user sends a "DELETE" request to "/books/{{createdId}}"
    Then the API response status code should be 404
