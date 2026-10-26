@ui @auth @system-test @regression
Feature: Web Interface Login Flow
  As a BookStore application user
  I want to log in through the web form
  In order to access the catalog administration dashboard

  @system-test @functional @positive-testing @security @authentication @usability @smoke @p1
  Scenario: Successful login through the graphical user interface
    Given the user navigates to "/login"
    When the user submits valid admin credentials on the login page
    Then the current URL should contain "/books"

  @system-test @functional @negative-testing @security @authentication @usability @equivalence-partitioning @error-guessing @p1
  Scenario: Visible error message upon invalid login attempt
    Given the user navigates to "/login"
    When the user submits email "admin@sandbox.com" and password "invalid_password" on the login page
    Then an error alert message should be displayed on screen
    And the current URL should contain "/login"

