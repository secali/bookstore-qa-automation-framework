@api @auth @integration-test @regression
Feature: Authentication and User Management via REST API
  As a BookStore QA Sandbox user
  I want to register and authenticate via the REST API
  In order to obtain a secure JWT token for catalog operations

  @integration-test @functional @positive-testing @security @authentication @contract @smoke @p1
  Scenario: Successful login with default seed administrator credentials
    When the user sends a "POST" request to "/auth/login" with body:
      """
      {
        "email": "admin@sandbox.com",
        "password": "admin123"
      }
      """
    Then the API response status code should be 200
    And the response should match the "AuthResponse" contract
    And the response JSONPath "$.token" should not be null or empty

  @integration-test @functional @negative-testing @security @authentication @equivalence-partitioning @error-guessing @reliability
  Scenario Outline: Authentication rejected with invalid credentials
    When the user sends a "POST" request to "/auth/login" with body:
      """
      {
        "email": "<email>",
        "password": "<password>"
      }
      """
    Then the API response status code should be 401
    And the response should contain error code "INVALID_CREDENTIALS"

    Examples:
      | email              | password         |
      | admin@sandbox.com  | wrong_password   |
      | nonexist@test.com  | admin123         |

  @integration-test @functional @positive-testing @contract @boundary-value-analysis @equivalence-partitioning @smoke @p1
  Scenario: Successful registration of a new user with valid dynamic data
    Given the user prepares a JSON payload:
      """
      {
        "name": "{{random_name}}",
        "email": "{{random_email}}",
        "password": "ValidPassword123!"
      }
      """
    When the user sends a "POST" request to "/auth/register" with the prepared payload
    Then the API response status code should be 201
    And the response should match the "AuthResponse" contract
    And the response JSONPath "$.id" should not be null or empty

  @integration-test @functional @negative-testing @contract @error-guessing @reliability @boundary-value-analysis
  Scenario: Registration rejected when email address is already taken
    Given the user prepares a JSON payload:
      """
      {
        "name": "{{random_name}}",
        "email": "{{random_email}}",
        "password": "ValidPassword123!"
      }
      """
    When the user sends a "POST" request to "/auth/register" with the prepared payload
    Then the API response status code should be 201
    When the user sends a "POST" request to "/auth/register" with the prepared payload
    Then the API response status code should be 409
    And the response should contain error code "EMAIL_ALREADY_EXISTS"
