@ui @auth @smoke
Feature: Web Interface Login Flow
  As a BookStore application user
  I want to log in through the web form
  In order to access the catalog administration dashboard

  Scenario: Successful login through the graphical user interface
    Given the user navigates to "/login"
    When the user submits valid admin credentials on the login page
    Then the current URL should contain "/books"

  @negative
  Scenario: Visible error message upon invalid login attempt
    Given the user navigates to "/login"
    When the user submits email "admin@sandbox.com" and password "invalid_password" on the login page
    Then an error alert message should be displayed on screen
    And the current URL should contain "/login"
