import { PrismaClient } from '@prisma/client'
import { mockReset, DeepMockProxy } from 'jest-mock-extended'
import prisma from './prisma'
import { TextEncoder, TextDecoder } from 'util'
import { jest, beforeEach } from '@jest/globals'

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as unknown as typeof global.TextDecoder;

jest.mock('./prisma', () => ({
  __esModule: true,
  default: {},
}));

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>