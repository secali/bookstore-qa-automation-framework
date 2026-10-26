@api @books @search @integration-test @regression
Feature: Book Catalog Search and Filtering via REST API
  As a BookStore user
  I want to search and filter the catalog via API
  In order to locate specific books quickly

  Background:
    Given the user is authenticated as an admin in the API

  @integration-test @functional @positive-testing @contract @search @equivalence-partitioning @smoke @p1
  Scenario: Search books by matching title term
    Given the user sends a "POST" request to "/books" with body:
      """
      {
        "title": "Design Patterns 2026",
        "author": "Erich Gamma",
        "isbn": "9780201633610",
        "price": 54.00,
        "category": "Software"
      }
      """
    Then the API response status code should be 201
    When the user sends a "GET" request to "/books?search=Design%20Patterns"
    Then the API response status code should be 200
    And the response should match the "BookList" contract
    And the response JSONPath "$" should be an array with at least 1 item(s)
