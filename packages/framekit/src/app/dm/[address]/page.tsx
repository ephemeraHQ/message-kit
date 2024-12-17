import { generateMetadata } from "./metadata";
import { ChatFrameClient } from "./ChatClient";

export { generateMetadata };

export default function ChatFrame(): JSX.Element {
  return <ChatFrameClient />;
}
