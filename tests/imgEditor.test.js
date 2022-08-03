import { resize, addFrame } from "../src/lib/imgEditor";
import fs from "fs-extra";

const mockToFile = jest.fn();
const mockGrayscale = jest.fn();
const mockMetadata = jest.fn();
const mockExtend = jest.fn();
const mockToBuffer = jest.fn();

jest.mock("sharp", () => () => ({
  resize: jest.fn().mockImplementation(() => ({
    toFile: mockToFile,
    grayscale: mockGrayscale,
  })),
  metadata: mockMetadata,
  toFile: mockToFile,
  grayscale: mockGrayscale,
  extend: mockExtend,
}));

jest.mock("path");

console.error = jest.fn();
console.info = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
});

describe("Image Editor", () => {
  describe("resize", () => {
    it("Throws an error if 'files' is undefined", async () => {
      const result = await resize();
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(result.errors.length).toBe(1);
    });

    it("Throws an error if 'files' is empty", async () => {
      const result = await resize([]);
      expect(result.errors.length).toBe(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("Throws an error if 'width' is not a number", async () => {
      const result = await resize(["file"], "invalidWidth");
      expect(result.errors.length).toBe(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("Throws an error if 'width' is less than or equal 0", async () => {
      const result = await resize(["file"], 0);
      expect(result.errors.length).toBe(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("Throws an error if 'width' is undefined and 'grayscale' is false", async () => {
      const result = await resize(["file"], undefined, false);
      expect(result.errors.length).toBe(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("Doesn't throw an error if 'width' is undefined but 'grayscale' is true", async () => {
      mockGrayscale.mockImplementation(() => ({ toFile: mockToFile }));

      mockToFile.mockImplementation((outDir, mockToFileCallback) => Promise.resolve({}));

      const result = await resize(["file"], undefined, true);

      expect(console.error).toHaveBeenCalledTimes(0);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(result.successful).toBe(1);
    });

    it("Doesn't throw any error if 'files' and 'width' are valid", async () => {
      mockToFile.mockImplementation((outDir, mockToFileCallback) => Promise.resolve({}));

      const result = await resize(["file"], 100);
      expect(console.error).toHaveBeenCalledTimes(0);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(result.successful).toBe(1);
    });

    it("Displays error if output file creation failed", async () => {
      mockToFile.mockImplementation((outDir, mockToFileCallback) => Promise.reject("error while saving the file"));

      const result = await resize(["file"], 100);

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledTimes(0);
      expect(result.failed).toBe(1);
      expect(result.errors.length).toBe(1);
    });

    it("Grayscale is called when 3rd argument is true", async () => {
      mockGrayscale.mockImplementation(() => ({ toFile: mockToFile }));

      mockToFile.mockImplementation((outDir, mockToFileCallback) => Promise.resolve({}));

      const result = await resize(["file"], 100, true);
      expect(console.error).toHaveBeenCalledTimes(0);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(mockToFile).toHaveBeenCalledTimes(1);
      expect(mockGrayscale).toHaveBeenCalledTimes(1);
      expect(result.successful).toBe(1);
    });
  });

  describe("add frame", () => {
    it("Throws an error if 'files' is undefined", async () => {
      const result = await addFrame();
      expect(result.errors.length).toBe(1);
      expect(console.error).toHaveBeenCalledTimes(1);
    });

    it("Extend is called when valid file(s) specified", async () => {
      mockExtend.mockImplementation(() => ({
        toFile: mockToFile,
      }));

      mockMetadata.mockImplementation(() => Promise.resolve({ width: 100, height: 100 }));
      mockToFile.mockImplementation((outDir, mockToFileCallback) => Promise.resolve({}));

      const result = await addFrame(["file"]);

      expect(console.error).toHaveBeenCalledTimes(0);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(result.successful).toBe(1);
    });

    //TODO: More tests are needed
    describe("When input is a buffer", () => {
      it("Returns a buffer when arguments are valid", async () => {
        mockExtend.mockImplementation(() => ({
          withMetadata: jest.fn().mockImplementation(() => ({
            toBuffer: mockToBuffer,
          })),
        }));
        mockToBuffer.mockImplementation(() => Promise.resolve({ data: Buffer.alloc(5), info: {} }));
        mockMetadata.mockImplementation(() => Promise.resolve({ width: 100, height: 100 }));
        const imgBuffer = await fs.readFile("./tests/mock_img.jpg");

        const result = await addFrame(imgBuffer, undefined, { frameColor: "#123" });
        console.log(result);

        expect(result.successful).toBe(1);
        expect(Buffer.isBuffer(result.data[0])).toBe(true);
        expect(console.error).toHaveBeenCalledTimes(0);
        expect(console.info).toHaveBeenCalledTimes(1);
      });
    });

    describe("Argument checks", () => {
      describe("printPaperOptions", () => {
        it("Throws an error if 'printPaperHeight' is 'undefined'", async () => {
          const result = await addFrame(["file"], { printPaperHeight: undefined, printPaperWidth: 200 });
          expect(result.errors.length).toBe(1);
          expect(console.error).toHaveBeenCalledTimes(1);
        });

        it("Throws an error if 'printPaperHeight' is 'null'", async () => {
          const result = await addFrame(["file"], { printPaperHeight: null, printPaperWidth: 200 });
          expect(result.errors.length).toBe(1);
          expect(console.error).toHaveBeenCalledTimes(1);
        });

        it("Throws an error if 'printPaperHeight' is not a number", async () => {
          const result = await addFrame(["file"], { printPaperHeight: "invalid", printPaperWidth: 200 });
          expect(result.errors.length).toBe(1);
          expect(console.error).toHaveBeenCalledTimes(1);
        });

        it("Throws an error if 'printPaperWidth' is 'undefined'", async () => {
          const result = await addFrame(["file"], { printPaperHeight: 200, printPaperWidth: undefined });
          expect(result.errors.length).toBe(1);
          expect(console.error).toHaveBeenCalledTimes(1);
        });

        it("Throws an error if 'printPaperWidth' is 'null'", async () => {
          const result = await addFrame(["file"], { printPaperHeight: 200, printPaperWidth: null });
          expect(result.errors.length).toBe(1);
          expect(console.error).toHaveBeenCalledTimes(1);
        });

        it("Throws an error if 'printPaperWidth' is not a number", async () => {
          const result = await addFrame(["file"], { printPaperHeight: 200, printPaperWidth: "invalid" });
          expect(result.errors.length).toBe(1);
          expect(console.error).toHaveBeenCalledTimes(1);
        });
      });

      describe("frameOptions", () => {
        it("Throws an error if 'frameColor' is 'undefined'", async () => {
          const result = await addFrame(["file"], undefined, { frameColor: undefined });
          expect(result.errors.length).toBe(1);
          expect(console.error).toHaveBeenCalledTimes(1);
        });

        it("Throws an error if 'frameColor' is 'null'", async () => {
          const result = await addFrame(["file"], undefined, { frameColor: null });
          expect(result.errors.length).toBe(1);
          expect(console.error).toHaveBeenCalledTimes(1);
        });

        it("Throws an error if 'frameColor' is not a valid hex color string", async () => {
          const result = await addFrame(["file"], undefined, { frameColor: "invalid color string" });
          expect(result.errors.length).toBe(1);
          expect(console.error).toHaveBeenCalledTimes(1);
        });

        it("Doesn't throw error if 'frameColor' is a valid hex color", async () => {
          mockExtend.mockImplementation(() => ({
            toFile: mockToFile,
          }));
          mockMetadata.mockImplementation(() => Promise.resolve({ width: 100, height: 100 }));

          const result = await addFrame(["file"], undefined, { frameColor: "#123" });

          expect(console.error).toHaveBeenCalledTimes(0);
          expect(console.info).toHaveBeenCalledTimes(1);
          expect(result.successful).toBe(1);
        });
      });
    });
  });
});
