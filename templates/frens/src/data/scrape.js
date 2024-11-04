import puppeteer from "puppeteer";
import fs from "fs";
const URL = "https://cryptonomads.org/DevconSideEvents2024";
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.goto(URL);
// Wait for the content to load
await page.waitForSelector(".thin-side-event-row", { timeout: 30000 });

// Check if the page content is loaded
const pageContent = await page.content();
if (pageContent.includes("thin-side-event-row")) {
  console.log("Page content loaded successfully");
} else {
  console.error("Page content not loaded as expected");
  // Optionally, you can throw an error or handle this situation differently
  throw new Error("Failed to load page content");
}

// Log the page title for debugging
const pageTitle = await page.title();
console.log("Page title:", pageTitle);

// Scroll to load all content (if needed)
await page.evaluate(() => {
  window.scrollTo(0, document.body.scrollHeight);
});

const eventsData = await page.evaluate(() => {
  const baseURL = "https://cryptonomads.org/DevconSideEvents2024";
  const events = document.querySelectorAll(".thin-side-event-row");
  return Array.from(events).map((event) => {
    const title = event.querySelector(".event-title")?.innerText || "No Title";
    const date =
      event.querySelector(".sm\\:col-start-1")?.innerText || "No Date";
    const time =
      event.querySelector(".whitespace-pre-line")?.innerText || "No Time";
    const organizer =
      event.querySelector(".text-xxs .break-normal")?.innerText ||
      "No Organizer";
    const href = baseURL + (event.getAttribute("href") || ""); // Use baseURL

    return {
      title,
      date,
      time,
      organizer,
      href,
    };
  });
});

// Function to convert data to CSV format
function convertToCSV(data) {
  const header = Object.keys(data[0]).join(",") + "\n";
  const rows = data.map((obj) =>
    Object.values(obj)
      .map((value) => `"${value}"`)
      .join(",")
  );
  return header + rows.join("\n");
}

// Convert eventsData to CSV format
const csvContent = convertToCSV(eventsData);

// Define the output file path
const outputPath = "src/data/thailand.csv";

// Write the CSV content to a file
fs.writeFileSync(outputPath, csvContent, "utf8");

console.log(`Data has been saved to ${outputPath}`);

await browser.close();
