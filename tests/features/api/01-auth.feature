@api @auth @regression
Feature: Authentication and User Management via REST API
  As a BookStore QA Sandbox user
  I want to register and authenticate via the REST API
  In order to obtain a secure JWT token for catalog operations

  @smoke @p1
  Scenario: Successful login with default seed administrator credentials
    When the user logs in via API with valid admin credentials
    Then the API response status code should be 200
    And the response should match the "AuthResponse" contract
    And the response should contain field "token"

  @negative @security
  Scenario Outline: Authentication rejected with invalid credentials
    When the user logs in via API with email "<email>" and password "<password>"
    Then the API response status code should be 401
    And the response should contain error code "INVALID_CREDENTIALS"

    Examples:
      | email              | password         |
      | admin@sandbox.com  | wrong_password   |
      | nonexist@test.com  | admin123         |

  @smoke @p1
  Scenario: Successful registration of a new user with valid dynamic data
    When the user registers via API with random valid data
    Then the API response status code should be 201
    And the response should match the "AuthResponse" contract

  @negative @contracts
  Scenario: Registration rejected when email address is already taken
    Given a new user is registered via API with random valid data
    When the user attempts to register with the same email address
    Then the API response status code should be 409
    And the response should contain error code "EMAIL_ALREADY_EXISTS"
