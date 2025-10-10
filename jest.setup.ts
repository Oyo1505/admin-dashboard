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
if (typeof global.Response === 'undefined') {
  // @ts-ignore
  global.Response = class Response {};
}

// @ts-ignore - Headers is not available in Node.js global types
if (typeof global.Headers === 'undefined') {
  // @ts-ignore
  global.Headers = class Headers {};
}
