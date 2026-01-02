import fs from 'fs';
import readline from 'readline';
import { ConversationExchange } from './types.js';
import crypto from 'crypto';
interface JSONLMessage {
  type: string;
  message?: {
    role: 'user' | 'assistant';
    content: string | Array<{ type: string; text?: string }>;
  };
  timestamp?: string;
  uuid?: string;
}
export async function parseConversation(
  filePath: string,
  projectName: string,
  archivePath: string
): Promise<ConversationExchange[]> {
  const exchanges: ConversationExchange[] = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  let lineNumber = 0;
  let currentExchange: {
    userMessage: string;
    userLine: number;
    assistantMessages: string[];
    lastAssistantLine: number;
    timestamp: string;
  } | null = null;
  const finalizeExchange = () => {
    if (currentExchange && currentExchange.assistantMessages.length > 0) {
      const exchange: ConversationExchange = {
        id: crypto
          .createHash('md5')
          .update(`${archivePath}:${currentExchange.userLine}-${currentExchange.lastAssistantLine}`)
          .digest('hex'),
        project: projectName,
        timestamp: currentExchange.timestamp,
        userMessage: currentExchange.userMessage,
        assistantMessage: currentExchange.assistantMessages.join('\n\n'),
        archivePath,
        lineStart: currentExchange.userLine,
        lineEnd: currentExchange.lastAssistantLine
      };
      exchanges.push(exchange);
    }
  };
  for await (const line of rl) {
    lineNumber++;
    try {
      const parsed: JSONLMessage = JSON.parse(line);
      if (parsed.type !== 'user' && parsed.type !== 'assistant') {
        continue;
      }
      if (!parsed.message) {
        continue;
      }
      let text = '';
      if (typeof parsed.message.content === 'string') {
        text = parsed.message.content;
      } else if (Array.isArray(parsed.message.content)) {
        text = parsed.message.content
          .filter(block => block.type === 'text' && block.text)
          .map(block => block.text)
          .join('\n');
      }
      if (!text.trim()) {
        continue;
      }
      if (parsed.message.role === 'user') {
        finalizeExchange();
        currentExchange = {
          userMessage: text,
          userLine: lineNumber,
          assistantMessages: [],
          lastAssistantLine: lineNumber,
          timestamp: parsed.timestamp || new Date().toISOString()
        };
      } else if (parsed.message.role === 'assistant' && currentExchange) {
        currentExchange.assistantMessages.push(text);
        currentExchange.lastAssistantLine = lineNumber;
        if (parsed.timestamp) {
          currentExchange.timestamp = parsed.timestamp;
        }
      }
    } catch (error) {
      continue;
    }
  }
  finalizeExchange();
  return exchanges;
}
