/*
 * app.js
 *
 * No framework. No build step. Just fetch() calls and a few small
 * "render a piece of the page" functions - each one is basically a
 * tiny component, it just doesn't need a fancy name to be one.
 */
const API_BASE_URL = document.body.dataset.apiBaseUrl;

let selectedReportId = null;
let selectedTestCaseId = null;
let allReports = []; // cached so the search box can filter without re-fetching

async function loadReports() {
  const response = await fetch(`${API_BASE_URL}/reports`);
  allReports = await response.json();
  renderReportsList(allReports);
}

function renderReportsList(reports) {
  const list = document.getElementById("reports-list");
  list.innerHTML = "";

  if (reports.length === 0) {
    const empty = document.createElement("li");
    empty.className = "placeholder";
    empty.textContent = "No reports match your search.";
    list.appendChild(empty);
    return;
  }

  for (const report of reports) {
    const item = document.createElement("li");
    item.className = "report-card";

    const name = document.createElement("p");
    name.className = "report-card-name";
    name.textContent = report.report_name;
    item.appendChild(name);

    const stats = document.createElement("p");
    stats.className = "report-card-stats";
    stats.textContent = `${report.passed_count} passed, ${report.failed_count} failed, ` +
      `${report.broken_count} broken, ${report.skipped_count} skipped`;
    item.appendChild(stats);

    item.addEventListener("click", () => selectReport(report.id, item));
    list.appendChild(item);
  }
}

document.getElementById("report-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  const filtered = query
    ? allReports.filter((r) => r.report_name.toLowerCase().includes(query))
    : allReports;
  renderReportsList(filtered);
});

document.getElementById("upload-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const statusEl = document.getElementById("upload-status");
  const fileInput = document.getElementById("upload-file");
  const nameInput = document.getElementById("upload-report-name");

  if (!fileInput.files.length) return;

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);
  formData.append("report_name", nameInput.value);

  statusEl.textContent = "Uploading and decoding...";
  statusEl.className = "";

  try {
    const response = await fetch(`${API_BASE_URL}/reports/upload`, { method: "POST", body: formData });
    const result = await response.json();
    if (!response.ok) throw new Error(result.detail || "Upload failed");

    statusEl.textContent = `Decoded as ${result.detected_format}: ${result.total_test_cases} test case(s).`;
    statusEl.className = "upload-status-ok";
    fileInput.value = "";
    nameInput.value = "";

    await loadReports();
  } catch (error) {
    statusEl.textContent = error.message;
    statusEl.className = "upload-status-error";
  }
});

async function selectReport(reportId, clickedItem) {
  selectedReportId = reportId;
  markSelected("reports-list", clickedItem);

  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/test-cases`);
  const testCases = await response.json();

  const list = document.getElementById("test-cases-list");
  list.innerHTML = "";

  for (const testCase of testCases) {
    const item = document.createElement("li");
    const badge = document.createElement("span");
    badge.className = `status-badge ${testCase.status}`;
    badge.textContent = testCase.status;
    item.appendChild(badge);
    item.appendChild(document.createTextNode(testCase.name));
    item.addEventListener("click", () => selectTestCase(testCase.id, item));
    list.appendChild(item);
  }

  loadReportSummary(reportId); // fires automatically - the user never has to ask for it
}

async function loadReportSummary(reportId) {
  const container = document.getElementById("ai-summary-content");
  container.innerHTML = '<p class="placeholder">Generating an AI summary of this report...</p>';

  const response = await fetch(`${API_BASE_URL}/reports/${reportId}/analyze`, { method: "POST" });
  const summary = await response.json();
  renderReportSummary(summary);
}

function renderReportSummary(summary) {
  const container = document.getElementById("ai-summary-content");
  container.innerHTML = "";

  const text = document.createElement("p");
  text.className = "ai-summary-text";
  text.textContent = summary.summary;
  container.appendChild(text);

  if (summary.failing_tests.length > 0) {
    const box = document.createElement("div");
    box.className = "failure-box";

    const heading = document.createElement("p");
    heading.className = "failure-box-heading";
    heading.textContent = `${summary.failing_tests.length} test case(s) need attention:`;
    box.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "failing-tests-list";
    for (const test of summary.failing_tests) {
      const item = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = `[${test.status}] ${test.name}`;
      item.appendChild(name);
      if (test.reason) {
        item.appendChild(document.createElement("br"));
        item.appendChild(document.createTextNode(test.reason));
      }
      list.appendChild(item);
    }
    box.appendChild(list);
    container.appendChild(box);
  }
}

async function selectTestCase(testCaseId, clickedItem) {
  selectedTestCaseId = testCaseId;
  markSelected("test-cases-list", clickedItem);

  const response = await fetch(`${API_BASE_URL}/test-cases/${testCaseId}`);
  const detail = await response.json();

  renderTestCaseDetail(detail);
}

function markSelected(listId, clickedItem) {
  const list = document.getElementById(listId);
  for (const child of list.children) {
    child.classList.remove("selected");
  }
  clickedItem.classList.add("selected");
}

function renderTestCaseDetail(detail) {
  const container = document.getElementById("detail-content");
  container.innerHTML = "";

  const title = document.createElement("h3");
  const badge = document.createElement("span");
  badge.className = `status-badge ${detail.status}`;
  badge.textContent = detail.status;
  title.appendChild(badge);
  title.appendChild(document.createTextNode(detail.name));
  container.appendChild(title);

  if (detail.failure_message) {
    const box = document.createElement("div");
    box.className = "failure-box";
    box.textContent = detail.failure_message;
    container.appendChild(box);
  }

  for (const step of detail.steps) {
    container.appendChild(renderStep(step));
  }
}

function renderStep(step) {
  const block = document.createElement("div");
  block.className = "step-block";

  const heading = document.createElement("h3");
  const badge = document.createElement("span");
  badge.className = `status-badge ${step.status}`;
  badge.textContent = step.status;
  heading.appendChild(badge);
  heading.appendChild(document.createTextNode(step.name));
  block.appendChild(heading);

  for (const attachment of step.attachments) {
    block.appendChild(renderAttachment(attachment));
  }

  return block;
}

function renderAttachment(attachment) {
  const wrapper = document.createElement("div");

  const label = document.createElement("p");
  label.className = "attachment-name";
  label.textContent = attachment.name;
  wrapper.appendChild(label);

  const rawUrl = `${API_BASE_URL}/attachments/${attachment.id}/raw`;

  // Allure has 20 attachment types (images, video, zip, pdf, and more),
  // not just the 3 we started with. Rather than special-case every one
  // by name, we decide how to show it using the two facts the backend
  // already gave us: is it binary, and does its mime type start with
  // "image/"? Anything binary that ISN'T an image (a zip, a pdf, a
  // video) can't usefully be shown inline on a plain page, so it gets
  // an honest download link instead of a broken, garbled attempt.
  if (attachment.mime_type.startsWith("image/")) {
    const img = document.createElement("img");
    img.className = "attachment-image";
    img.src = rawUrl;
    wrapper.appendChild(img);
  } else if (!attachment.has_binary_content && attachment.mime_type === "text/csv") {
    wrapper.appendChild(renderCsvAsTable(attachment.text_content));
  } else if (!attachment.has_binary_content) {
    const pre = document.createElement("pre");
    pre.className = "attachment-text";
    pre.textContent = attachment.text_content;
    wrapper.appendChild(pre);
  } else {
    const link = document.createElement("a");
    link.href = rawUrl;
    link.textContent = `Download ${attachment.name} (${attachment.mime_type})`;
    link.className = "attachment-download-link";
    wrapper.appendChild(link);
  }

  return wrapper;
}

function renderCsvAsTable(csvText) {
  const table = document.createElement("table");
  table.className = "csv-table";

  const rows = csvText.trim().split("\n").map((line) => line.split(","));
  rows.forEach((cells, rowIndex) => {
    const row = document.createElement("tr");
    for (const cell of cells) {
      const tag = rowIndex === 0 ? "th" : "td";
      const cellElement = document.createElement(tag);
      cellElement.textContent = cell;
      row.appendChild(cellElement);
    }
    table.appendChild(row);
  });

  return table;
}

loadReports();
