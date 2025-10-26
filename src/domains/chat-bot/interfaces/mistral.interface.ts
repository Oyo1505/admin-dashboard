export interface IMistralService {
  chat: {
    complete: (params: MistralCompleteParams) => Promise<MistralResponse>; // eslint-disable-line no-unused-vars
    parse: (params: MistralParseParams) => Promise<MistralResponse>; // eslint-disable-line no-unused-vars
  };
}

export interface MistralCompleteParams {
  model: string;
  temperature: number;
  tools: unknown[];
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
  responseFormat: unknown;
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
