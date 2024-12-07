import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
const poapsID = process.env.NOTION_POAP_DB;
const pageId = process.env.NOTION_PAGE_ID;

export async function updateDB() {
  await notion.pages.update({
    page_id: pageId as string,
    properties: {
      RSVP: {
        type: "select",
        select: {
          name: "No",
        },
      },
    },
  });
}
export async function downloadPage() {
  const blocks = await notion.blocks.children.list({
    block_id: pageId as string,
  });
  const markdown = blocks.results
    .map((block: any) => {
      switch (block.type) {
        case "paragraph":
          return block.paragraph.rich_text
            .map((text: any) => text.plain_text)
            .join("");
        case "heading_1":
          return `# ${block.heading_1.rich_text
            .map((text: any) => text.plain_text)
            .join("")}`;
        case "heading_2":
          return `## ${block.heading_2.rich_text
            .map((text: any) => text.plain_text)
            .join("")}`;
        case "heading_3":
          return `### ${block.heading_3.rich_text
            .map((text: any) => text.plain_text)
            .join("")}`;
        case "bulleted_list_item":
          return `- ${block.bulleted_list_item.rich_text
            .map((text: any) => text.plain_text)
            .join("")}`;
        case "numbered_list_item":
          return `- ${block.numbered_list_item.rich_text
            .map((text: any) => text.plain_text)
            .join("")}`;
        // Add more cases for other block types as needed
        default:
          return "";
      }
    })
    .join("\n");
  return markdown;
}
export async function downloadPoapTable() {
  const response = await notion.databases.query({
    database_id: poapsID as string,
  });

  const poapTable = response.results.map((page: any) => {
    const url = page.properties.Url.url;
    const address = page.properties.Address.title[0]?.plain_text;
    const id = page.id;
    return { url, address, id };
  });
  return poapTable as { url: string; address: string; id: string }[];
}
export async function updatePoapAddress(dbRowId: string, address: string) {
  await notion.pages.update({
    page_id: dbRowId as string,
    properties: {
      Address: {
        type: "title",
        title: [
          {
            type: "text",
            text: { content: address },
          },
        ],
      },
    },
  });
}
