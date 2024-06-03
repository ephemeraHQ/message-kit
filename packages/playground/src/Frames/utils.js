import { readMetadata } from "./openFrames";

export const fetchFrameFromUrl = async (message) => {
  let content = message.content;
  if (content?.content) content = content?.content;
  if (!content || typeof content !== "string") return;
  try {
    const words = content?.split(/(\r?\n|\s+)/);
    // Improved regex to better handle URLs with multiple query parameters and special characters
    const urlRegex = /https?:\/\/[^\s$.?#].[^\s]*$/i;
    const metadataPromises = words.map(async (word) => {
      const isUrl = !!word.match(urlRegex)?.[0];
      if (isUrl) {
        //console.log("Processing URL:", word);
        return await readMetadata(word); // Attempt to fetch metadata for each URL
      }
    });
    const metadataResults = await Promise.all(metadataPromises);
    const validMetadata = metadataResults.filter(
      (metadata) => metadata !== undefined,
    );
    return validMetadata[0]; // Return the first valid metadata found, or undefined if none
  } catch (e) {
    console.log(content);
    console.log(e);
  }
};
