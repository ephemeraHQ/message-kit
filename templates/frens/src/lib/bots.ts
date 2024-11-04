const isDeployed = process.env.NODE_ENV === "production";

export async function getBotName(address: string) {
  return botAddresses.find(
    (bot) =>
      (isDeployed ? bot.address : bot.devAddress) === address.toLowerCase()
  )?.name;
}

export const getBotAddress = (name: string) => {
  if (botAddresses) {
    return botAddresses.find(
      (bot) => bot.name.toLowerCase() === name.toLowerCase()
    )?.[isDeployed ? "address" : "devAddress"];
  }
  return "";
};

export type BotAddress = {
  name: string;
  address: string;
  devAddress: string;
  color: string;
  terminalColor: string;
  domain: string;
  privateKey: string;
  hideInitLogMessage: true;
};
export const botAddresses: BotAddress[] = [
  {
    name: "earl",
    address: "0x840c601502C56087dA44A8176791d33f4b741aeC",
    devAddress: "0xe9791cb9Db1eF92Ed0670B31ab9a9453AA7BFb4c",
    color: "#1AADFF",
    terminalColor: "\x1b[38;2;26;170;255m",
    domain: "earl.frens.eth",
    privateKey: process.env.KEY_EARL as string,
    hideInitLogMessage: true,
  },
  {
    name: "lili",
    address: "0xE1f36769cfBf168d18d37D5257825E1E272ba843",
    devAddress: "0xFD18Eff445A32010bFB2Ab32A0F7A02CF08bAfdB",
    color: "#019850",
    terminalColor: "\x1b[38;2;1;152;80m",
    domain: "lili.frens.eth",
    privateKey: process.env.KEY_LILI as string,
    hideInitLogMessage: true,
  },
  {
    name: "bittu",
    address: "0xf6A5657d0409eE8188332f0d3E9348242b54c4dc",
    devAddress: "0xa1C6718567B4960380235a07c1B0793aF81B1264",
    color: "F7A0EF",
    terminalColor: "\x1b[38;2;247;160;239m",
    domain: "bittu.frens.eth",
    privateKey: process.env.KEY_BITTU as string,
    hideInitLogMessage: true,
  },
  {
    name: "kuzco",
    address: "0xbef3B8277D99A7b8161C47CD82e85356D26E4429",
    devAddress: "0x3C348aEF831a28f80FF261B028a0A9b2491C0BA6",
    color: "F66A1F",
    terminalColor: "\x1b[38;2;246;106;31m",
    domain: "kuzco.frens.eth",
    privateKey: process.env.KEY_KUZCO as string,
    hideInitLogMessage: true,
  },
  {
    name: "peanut",
    address: "0xc143D1b3a0Fe554dF36FbA0681f9086cf2640560",
    devAddress: "0x839e618F3b928195b9572e3939bEF13ddF446717",
    color: "#F54F00",
    terminalColor: "\x1b[38;2;245;79;0m",
    domain: "peanut.frens.eth",
    privateKey: process.env.KEY_PEANUT as string,
    hideInitLogMessage: true,
  },
];

export function isBot(address: string) {
  return botAddresses.some(
    (bot) =>
      (isDeployed ? bot.address : bot.devAddress).toLowerCase() ===
      address.toLowerCase()
  );
}

export function replaceDeeplinks(generalPrompt: string) {
  generalPrompt = generalPrompt.replace(
    "kuzco.frens.eth",
    getBotAddress("kuzco") || ""
  );
  generalPrompt = generalPrompt.replace(
    "lili.frens.eth",
    getBotAddress("lili") || ""
  );
  generalPrompt = generalPrompt.replace(
    "peanut.frens.eth",
    getBotAddress("peanut") || ""
  );
  generalPrompt = generalPrompt.replace(
    "bittu.frens.eth",
    getBotAddress("bittu") || ""
  );
  generalPrompt = generalPrompt.replace(
    "earl.frens.eth",
    getBotAddress("earl") || ""
  );
  return generalPrompt;
}
