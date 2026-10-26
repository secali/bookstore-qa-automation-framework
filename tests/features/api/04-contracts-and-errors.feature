@api @contracts @negative @integration-test @regression
Feature: OpenAPI Contracts Validation and Standard Error Envelope
  As a QA Automation Architect
  I want to ensure the API strictly adheres to standard contract structures
  In order to guarantee stability for consuming web and mobile clients

  Background:
    Given the user is authenticated as an admin in the API

  @integration-test @contract @negative-testing @boundary-value-analysis @equivalence-partitioning @reliability @p1
  Scenario Outline: Rejection when attempting to create a book with invalid schema data
    When the user attempts to create a book with isbn "<isbn>" and price <price>
    Then the API response status code should be 400
    And the response should match the "Error" contract
    And the response should contain error code "VALIDATION_ERROR"
    And the error details should indicate a failure in field "<expected_field>"

    Examples:
      | isbn            | price  | expected_field |
      | invalid_isbn    | 25.00  | isbn           |
      | 9780132350884   | -15.00 | price          |

  @integration-test @security @authorization @negative-testing @contract @reliability @p1
  Scenario: Rejection when attempting to create a book without authorization header
    When the user attempts to create a book without authentication token
    Then the API response status code should be 401
    And the response should match the "Error" contract

  @integration-test @functional @negative-testing @error-guessing @reliability
  Scenario: Retrieval of a book with non-existent identifier returns 404
    When the user retrieves a book with non-existent id "64f1a2b3c4d5e6f7a8b9c0d1"
    Then the API response status code should be 404
    And the response should match the "Error" contract

