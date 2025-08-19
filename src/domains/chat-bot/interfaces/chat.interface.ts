export interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  id: string;
}

export interface ChatResponse {
  answer: string;
  status: number;
}
