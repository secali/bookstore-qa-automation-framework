@ui @hybrid @system-integration-test @system-test @integration-test @regression
Feature: Hybrid E2E Flow (Fast API Injection and UI Verification)
  As an SDET Automation Engineer
  I want to pre-seed complex state via REST API and verify it instantly on the UI
  In order to eliminate slow UI multi-step setup and prevent flakiness

  @system-integration-test @functional @positive-testing @hybrid @usability @equivalence-partitioning @smoke @p1
  Scenario: Book created via API is immediately visible and searchable on the UI
    Given the user is authenticated as an admin in the API
    And the user sends a "POST" request to "/books" with body:
      """
      {
        "title": "Multi-Agent QA Architecture",
        "author": "Sergio Cañete",
        "isbn": "{{random_isbn}}",
        "price": 49.99,
        "category": "Architecture"
      }
      """
    Then the API response status code should be 201
    Given the user opens "/books" with preloaded API session
    When the user enters "Multi-Agent QA Architecture" into the "search" field
    Then in the table, the row containing "Multi-Agent QA Architecture" should be visible
