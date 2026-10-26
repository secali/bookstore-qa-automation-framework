@ui @auth @system-test @regression
Feature: Web Interface Login Flow
  As an application user
  I want to log in through the web form
  In order to access the administration dashboard

  @system-test @functional @positive-testing @security @authentication @usability @smoke @p1
  Scenario: Successful login through the graphical user interface
    Given the user navigates to "/login"
    When the user enters "admin@sandbox.com" into the "email" field
    And the user enters "admin123" into the "password" field
    And the user clicks the "Login" button
    Then the current URL should contain "/books"

  @system-test @functional @negative-testing @security @authentication @usability @equivalence-partitioning @error-guessing @p1
  Scenario: Visible error message upon invalid login attempt
    Given the user navigates to "/login"
    When the user enters "admin@sandbox.com" into the "email" field
    And the user enters "invalid_password" into the "password" field
    And the user clicks the "Login" button
    Then an error alert message should be displayed on screen
    And the current URL should contain "/login"
