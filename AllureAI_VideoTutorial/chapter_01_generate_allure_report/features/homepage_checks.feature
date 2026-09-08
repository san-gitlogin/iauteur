Feature: Python.org homepage health checks
  As a website owner
  I want automated checks against the homepage
  So that I know quickly if something on the site breaks

  Background:
    Given the target website is "https://www.python.org"

  @critical
  Scenario: Homepage responds successfully
    When I send a GET request to the homepage
    Then the response status code should be 200

  Scenario: Homepage mentions Python
    When I download the homepage HTML
    Then the page text should contain "Python"

  @critical
  Scenario: Homepage screenshot is captured
    When I visit the homepage in a real browser
    Then a full page screenshot should be attached

  Scenario: Homepage response time is measured 3 times
    When I send the homepage request 3 times and record the timing
    Then every attempt should respond within 5000 milliseconds

  Scenario: Homepage screenshot is also captured as a JPEG
    When I visit the homepage in a real browser and capture a JPEG screenshot
    Then a JPEG screenshot should be attached

  Scenario: Homepage evidence is archived into a zip file
    When I download the homepage HTML
    Then the evidence should be archived into a zip attachment

  Scenario: Homepage check summary is recorded in three formats
    When I download the homepage HTML
    Then a JSON summary should be attached
    And an XML summary should be attached
    And a YAML summary should be attached

  Scenario: This check is written to fail on purpose
    When I download the homepage HTML
    Then the page text should contain "This text will never appear on python.org"

  Scenario: This check is broken by an unexpected error
    When something unexpected goes wrong while checking the homepage

  @skip_this
  Scenario: This check is skipped on purpose
    When I skip this check on purpose
