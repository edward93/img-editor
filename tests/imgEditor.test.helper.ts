import { jest } from "@jest/globals";

export const mockToFile = jest.fn();
export const mockGrayscale = jest.fn();
export const mockMetadata = jest.fn();
export const mockExtend = jest.fn();
export const mockToBuffer = jest.fn();
export const mockWithMetadata = jest.fn();

jest.mock("sharp", () => () => ({
  resize: jest.fn().mockImplementation(() => ({
    toFile: mockToFile,
    grayscale: mockGrayscale,
  })),
  metadata: mockMetadata,
  toFile: mockToFile,
  grayscale: mockGrayscale,
  extend: mockExtend,
  withMetadata: mockWithMetadata,
}));
