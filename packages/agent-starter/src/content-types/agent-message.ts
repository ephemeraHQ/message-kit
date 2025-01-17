import { ContentTypeId } from "@xmtp/content-type-primitives";
import type {
  ContentCodec,
  EncodedContent,
} from "@xmtp/content-type-primitives";

// Create a unique identifier for your content type
export const ContentTypeAgentMessage = new ContentTypeId({
  authorityId: "xmtp.org",
  typeId: "agent_message",
  versionMajor: 1,
  versionMinor: 0,
});

// Define the message structure with metadata
export class AgentMessage {
  public text: string;
  public metadata: {
    agentId: string;
    skillUsed?: string;
    timestamp: number;
    isAgent: boolean;
    [key: string]: any; // Allow for flexible metadata
  };

  constructor(text: string, metadata: any) {
    this.text = text;
    this.metadata = {
      timestamp: Date.now(),
      isAgent: true,
      ...metadata,
    };
  }
}

// Define the codec
export class AgentMessageCodec implements ContentCodec<AgentMessage> {
  get contentType(): ContentTypeId {
    return ContentTypeAgentMessage;
  }

  encode(message: AgentMessage): EncodedContent {
    return {
      type: ContentTypeAgentMessage,
      parameters: {},
      content: new TextEncoder().encode(JSON.stringify(message)),
    };
  }

  decode(encodedContent: EncodedContent): AgentMessage {
    const decoded = new TextDecoder().decode(encodedContent.content);
    const { text, metadata } = JSON.parse(decoded);
    return new AgentMessage(text, metadata);
  }

  // Only show the message text in unsupported clients
  fallback(content: AgentMessage): string {
    return content.text;
  }

  shouldPush(): boolean {
    return true;
  }
}
