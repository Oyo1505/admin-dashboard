export interface IMistralService {
  chat: {
    complete: (params: MistralCompleteParams) => Promise<MistralResponse>;
    parse: (params: MistralParseParams) => Promise<MistralResponse>;
  };
}

export interface MistralCompleteParams {
  model: string;
  temperature: number;
  tools: any[];
  toolChoice: string;
  parallelToolCalls: boolean;
  messages: Array<{
    role: string;
    content: string;
  }>;
}

export interface MistralParseParams {
  model: string;
  temperature: number;
  messages: Array<{
    role: string;
    content: string;
  }>;
  responseFormat: any;
}

export interface MistralResponse {
  choices?: Array<{
    message: {
      content?: string;
      toolCalls?: Array<{
        function: {
          name: string;
        };
      }>;
    };
  }>;
} 