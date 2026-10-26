@api @books @search @regression
Feature: Book Catalog Search and Filtering via REST API
  As a BookStore user
  I want to search and filter the catalog via API
  In order to locate specific books quickly

  Background:
    Given the user is authenticated as an admin in the API

  Scenario: Search books by matching title term
    Given a new book is created via API with the following data:
      | title                 | author      | isbn          | price | category |
      | Design Patterns 2026  | Erich Gamma | 9780201633610 | 54.00 | Software |
    When the user searches books in the API with term "Design Patterns"
    Then the API response status code should be 200
    And the response should match the "BookList" contract
    And the books list should contain at least 1 book
