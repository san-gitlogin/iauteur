"""
Behave lifecycle hooks.

We launch ONE real Playwright/Chromium browser for the whole run and
reuse it across scenarios, closing it cleanly at the end. This is the
BDD equivalent of pytest fixtures.
"""
from playwright.sync_api import sync_playwright


def before_all(context):
    context.playwright = sync_playwright().start()
    context.browser = context.playwright.chromium.launch()


def after_all(context):
    context.browser.close()
    context.playwright.stop()
