@ui @hybrid @smoke
Feature: Hybrid E2E Flow (Fast API Injection and UI Verification)
  As an SDET Automation Engineer
  I want to pre-seed complex state via REST API and verify it instantly on the UI
  In order to eliminate slow UI multi-step setup and prevent flakiness

  Scenario: Book created via API is immediately visible and searchable on the UI
    Given a book has been previously created via API with title "Multi-Agent QA Architecture" and price 49.99
    And the user accesses the books dashboard with an active authenticated session
    When the user searches the catalog for "Multi-Agent QA Architecture"
    Then the books table should display a book with title "Multi-Agent QA Architecture"
