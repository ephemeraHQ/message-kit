import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API key
  network: Network.BASE_MAINNET, // Use the appropriate network
};

export async function checkNft(
  walletAddress: string,
  collectionSlug: string,
): Promise<boolean> {
  const alchemy = new Alchemy(settings);
  try {
    const nfts = await alchemy.nft.getNftsForOwner(walletAddress);

    const ownsNft = nfts.ownedNfts.some(
      (nft: any) =>
        nft.contract.name.toLowerCase() === collectionSlug.toLowerCase(),
    );
    // console.log(
    //   `NFTs owned on ${Network.BASE_MAINNET}:`,
    //   nfts.ownedNfts.length,
    // );
    console.log("is the nft owned: ", ownsNft);
    return ownsNft as boolean;
  } catch (error) {
    console.error("Error fetching NFTs from Alchemy:", error);
  }

  return false;
}
