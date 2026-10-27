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
        "isbn": "{{random_isbn}}",
        "publishedYear": 2024,
        "price": 45.50,
        "category": "Tech"
      }
      """
    Then the API response status code should be 201
    And the response should match the "Book" contract
    And the response FROM "/books" is validated with data:
      | jsonPath | Value |
      | $.title  | Architecture with Kafka |
      | $.price  | 45.50 |
      | $.author | Sergio Cañete |

  @integration-test @functional @positive-testing @contract @equivalence-partitioning @atomic @generic @p1
  Scenario: Create a book mutating base template via dynamic JSONPath and verify persistence
    Given the user prepares a JSON payload:
      """
      {
        "title": "Base Title",
        "author": "Sergio Cañete",
        "isbn": "{{random_isbn}}",
        "publishedYear": 2024,
        "price": 10.00,
        "category": "Architecture"
      }
      """
    When the user updates the prepared payload with data:
      | jsonPath | Value |
      | $.title  | {{random_title}} |
      | $.price  | 49.99 |
    When the user sends a "POST" request to "/books" with the prepared payload
    Then the API response status code should be 201
    And the response should match the "Book" contract
    And the response is validated with data:
      | jsonPath | Value |
      | $.title  | not null |
      | $.price  | 49.99 |
    When the user saves the response JSONPath "$.id" as "createdItemId"
    And the user sends a "GET" request to "/books/{{createdItemId}}"
    Then the API response status code should be 200
    And the response FROM "/books/{{createdItemId}}" is validated with data:
      | jsonPath | Value |
      | $.id     | {{createdItemId}} |

  @integration-test @functional @positive-testing @negative-testing @state-transition @contract @reliability @p1
  Scenario: Full entity lifecycle: Create, Retrieve by ID, Update and Delete
    Given the user prepares a JSON payload:
      """
      {
        "title": "{{random_title}}",
        "author": "Sergio Cañete",
        "isbn": "{{random_isbn}}",
        "publishedYear": 2024,
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
