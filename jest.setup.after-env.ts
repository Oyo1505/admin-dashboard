/**
 * Jest setup file that runs after the test environment is set up
 * This file should be used for test framework extensions
 */

// Import jest-dom for additional matchers
import '@testing-library/jest-dom';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
  useLocale: () => 'fr',
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
    number: (value: number) => value.toString(),
  }),
}));
