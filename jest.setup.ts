/**
 * Jest setup file for global test environment configuration
 * This file runs before each test file
 */

import { TextDecoder, TextEncoder } from 'util';
import { ReadableStream, TransformStream } from 'stream/web';

// Polyfill TextEncoder/TextDecoder for Node.js environment
// Required for Next.js 15 compatibility with Jest
global.TextEncoder = TextEncoder as typeof global.TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Polyfill Web Streams API
global.ReadableStream = ReadableStream as typeof global.ReadableStream;
global.TransformStream = TransformStream as typeof global.TransformStream;

// Polyfill Request/Response for Next.js server components
// @ts-ignore - Request is not available in Node.js global types
if (typeof global.Request === 'undefined') {
  // @ts-ignore
  global.Request = class Request {};
}

// @ts-ignore - Response is not available in Node.js global types
if (typeof global.Response === 'undefined' || !global.Response.json) {
  // @ts-ignore
  global.Response = class Response {
    body: string;
    status: number;
    headers: Map<string, string>;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = typeof body === 'string' ? body : JSON.stringify(body);
      this.status = init?.status || 200;
      this.headers = new Map();
    }

    async json() {
      return JSON.parse(this.body);
    }

    async text() {
      return this.body;
    }

    static json(data: unknown, init?: ResponseInit) {
      const response = new Response(JSON.stringify(data), init);
      return response;
    }
  };
}

// @ts-ignore - Headers is not available in Node.js global types
if (typeof global.Headers === 'undefined') {
  // @ts-ignore
  global.Headers = class Headers {};
}
