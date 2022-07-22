import { resize } from "../src/lib/imgEditor";

const mockToFileCallback = jest.fn();
const mockToFile = jest.fn();
const mockGrayscale = jest.fn();

jest.mock("sharp", () => () => ({
  resize: jest.fn().mockImplementation(() => ({
    // toFile: jest.fn().mockImplementation((outDir, mockToFileCallback) => {
    //   mockToFileCallback(false, {});
    // })
    toFile: mockToFile,
    grayscale: mockGrayscale,
  })),
  toFile: mockToFile,
  grayscale: mockGrayscale,
}));

jest.mock("path");

console.error = jest.fn();
console.info = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Resize", () => {
  it("Throws an error if 'files' is undefined", async () => {
    const result = await resize();
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("Throws an error if 'files' is empty", async () => {
    const result = await resize([]);
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("Throws an error if 'width' is not a number", async () => {
    const result = await resize(["file"], "invalidWidth");
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("Throws an error if 'width' is less than or equal 0", async () => {
    const result = await resize(["file"], 0);
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("Throws an error if 'width' is undefined and 'grayscale' is false", async () => {
    const result = await resize(["file"], undefined, false);
    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it("Doesn't throw an error if 'width' is undefined but 'grayscale' is true", async () => {
    mockGrayscale.mockImplementation(() => ({ toFile: mockToFile }));

    mockToFile.mockImplementation((outDir, mockToFileCallback) => Promise.resolve({}));

    const result = await resize(["file"], undefined, true);

    expect(console.error).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it("Doesn't throw any error if 'files' and 'width' are valid", async () => {
    mockToFile.mockImplementation((outDir, mockToFileCallback) => Promise.resolve({}));

    const result = await resize(["file"], 100);
    expect(console.error).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it("Displays error if output file creation failed", async () => {
    mockToFile.mockImplementation((outDir, mockToFileCallback) => Promise.reject("error while saving the file"));

    const result = await resize(["file"], 100);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.info).toHaveBeenCalledTimes(0);
    expect(result).toBe(false);
  });

  it("Grayscale is called when 3rd argument is true", async () => {
    mockGrayscale.mockImplementation(() => ({ toFile: mockToFile }));

    mockToFile.mockImplementation((outDir, mockToFileCallback) => Promise.resolve({}));

    const result = await resize(["file"], 100, true);
    expect(console.error).toHaveBeenCalledTimes(0);
    expect(console.info).toHaveBeenCalledTimes(1);
    expect(mockToFile).toHaveBeenCalledTimes(1);
    expect(mockGrayscale).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });
});
