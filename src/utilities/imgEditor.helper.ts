import sharp from "sharp";
import path from "path";

import { FrameOptions, PrintPaperOptions, ProcessedImagesInfo } from "../lib/imgEditor.types";

/**
 * Adds a frame around the image to change the aspect ratio.
 *
 * @param {string[]} input - list of input files
 * @param {PrintPaperOptions} printPaperOptions - information about the printing paper
 * @param {FrameOptions} frameOptions - information about the frame color and image position with the frame (image position is currently not used)
 * @param {string} output - output folder
 * @param {number} frameWidthFactor - width of the frame (smallest dimension x frameWidthFactor)
 * @returns {Promise<ProcessedImagesInfo>} - Information about the operation
 *
 * @private
 */
export const addFrameFromListOfFiles = async (
  input: string[],
  printPaperOptions: PrintPaperOptions,
  frameOptions: FrameOptions,
  output: string,
  frameWidthFactor: number
) => {
  const result: ProcessedImagesInfo = { data: [], successful: 0, failed: 0, errors: [] };
  // perform the operation for each file
  await input.map(async (file) => {
    //#region prepping necessary data for processing the image
    // Construct the output file
    const outPath = constructOutputPath(file, output, OPERATION_CODES.addFrame);

    // get information about the current file
    const { width, height } = await sharp(file).metadata();
    if (!width || !height) {
      const errMsg = "Could not retrieve metadata of the input file";
      result.errors.push(errMsg);
      // log
      console.error(errMsg);
      return result;
    }

    // get frame measurements
    const { top, left, right, bottom } = calculateFrameDimensions(width, height, printPaperOptions, frameWidthFactor);
    //#endregion

    //#region processing the image
    // edit the image
    try {
      //TODO: save each image to file async
      const info = await sharp(file)
        .extend({
          top,
          left,
          right,
          bottom,
          background: frameOptions.frameColor,
        })
        .toFile(outPath);

      console.info(info);
      result.successful++;
      result.data.push(info);
    } catch (error) {
      // something went wrong
      console.error(error);
      result.failed++;
    }
    //#endregion
  });

  return result;
};

/**
 * Adds a frame around the image to change the aspect ratio.
 *
 * @param {Buffer} input - Input image buffer
 * @param {PrintPaperOptions} printPaperOptions - information about the printing paper
 * @param {FrameOptions} frameOptions - information about the frame color and image position with the frame (image position is currently not used)
 * @param {number} frameWidthFactor - width of the frame (smallest dimension x frameWidthFactor)
 * @returns {Promise<ProcessedImagesInfo>} - Information about the operation
 *
 * @private
 */
export const addFrameFromBuffer = async (
  input: Buffer,
  printPaperOptions: PrintPaperOptions,
  frameOptions: FrameOptions,
  frameWidthFactor: number
): Promise<ProcessedImagesInfo> => {
  const result: ProcessedImagesInfo = { data: [], successful: 0, failed: 0, errors: [] };

  //#region prepping necessary data for processing the image

  // get information about the current file
  const { width, height } = await sharp(input).metadata();
  if (!width || !height) {
    const errMsg = "Could not retrieve metadata of the input file";
    result.errors.push(errMsg);
    // log
    console.error(errMsg);
    return result;
  }

  // get frame measurements
  const { top, left, right, bottom } = calculateFrameDimensions(width, height, printPaperOptions, frameWidthFactor);
  //#endregion

  //#region processing the image
  // edit the image
  try {
    const { data, info } = await sharp(input)
      .extend({
        top,
        left,
        right,
        bottom,
        background: frameOptions.frameColor,
      })
      .withMetadata()
      .toBuffer({ resolveWithObject: true });

    // log
    console.info(info);

    // add the processed buffer
    result.data.push(data);
    result.successful++;
  } catch (error) {
    // something went wrong
    console.error(error);
    result.failed++;
  }

  return result;
  //#endregion
};

/**
 * Calculates necessary measurements of the frame
 *
 * @param {number} width
 * @param {number} height
 * @param {PrintPaperOptionsType} printPaperOptions - information about the printing paper
 * @param {FrameOptionsType} frameOptions - information about the frame color and image position with the frame (image position is currently not used)
 * @returns an object with top, lef, right, and bottom values
 *
 * @private
 */
export const calculateFrameDimensions = (
  width: number,
  height: number,
  printPaperOptions: PrintPaperOptions,
  frameWidthFactor: number
) => {
  const outputAspectRatio =
    width > height
      ? printPaperOptions.printPaperHeigh / printPaperOptions.printPaperWidth
      : printPaperOptions.printPaperWidth / printPaperOptions.printPaperHeigh;

  let top,
    left,
    right,
    bottom = 0;

  if (width > height) {
    // landscape mode

    const frameWidth = Math.round(height * frameWidthFactor);
    const outputWidth = (2 * frameWidth + height) * outputAspectRatio;

    // calculate frame size
    top = frameWidth;
    left = Math.round((outputWidth - width) / 2);
    right = Math.round((outputWidth - width) / 2);
    bottom = frameWidth;
  } else {
    // portrait or square mode

    const frameLength = Math.round(width * frameWidthFactor);
    const outputHeight = (width + 2 * frameLength) / outputAspectRatio;

    // calculate frame size
    top = frameLength;
    left = frameLength;
    right = frameLength;
    bottom = outputHeight - height - frameLength;
  }

  // make sure margins are not negative
  if (top < 0 || left < 0 || right < 0 || bottom < 0)
    throw Error(
      `Frame calculation is incorrect, frame boarders cannot be negative: top = ${top} left = ${left} right = ${right} bottom = ${bottom}`
    );
  return { top, left, right, bottom };
};

/**
 * Check passed arguments and return true if they are valid
 *
 * @param {string[]} input - glob, file names
 * @param {PrintPaperOptionsType} printPaperOptions - information about the printing paper
 * @param {{frameColor: string, imagePosition: {x: number, y: number}}} frameOptions - information about the frame color and image position with the frame (image position is currently not used)
 * @param {string} output - output folder
 * @returns True if arguments are OK
 *
 * @private
 */
export const checkArguments = (
  input: string[] | Buffer,
  printPaperOptions: PrintPaperOptions = { printPaperWidth: 4, printPaperHeigh: 6 },
  frameOptions: FrameOptions = { frameColor: "#fff", imagePosition: { x: 0, y: 0 } },
  output = ".",
  processResult: ProcessedImagesInfo
) => {
  if (!input || (input && input.length === 0)) {
    const errMsg = "No input files found";
    processResult.errors.push(errMsg);
    console.error(errMsg);
    return false;
  } else if (
    printPaperOptions.printPaperWidth === undefined ||
    printPaperOptions.printPaperHeigh === undefined ||
    printPaperOptions.printPaperWidth === null ||
    printPaperOptions.printPaperHeigh === null ||
    isNaN(printPaperOptions.printPaperWidth) ||
    isNaN(printPaperOptions.printPaperHeigh)
  ) {
    processResult.errors.push(`printPaperWidth and printPaperHeight must be specified and valid numbers`);
    console.error(`printPaperWidth and printPaperHeight must be specified and valid numbers`);
    return false;
  } else if (
    frameOptions.frameColor === undefined ||
    frameOptions.frameColor === null ||
    !new RegExp("^#([a-fA-F0-9]){3}$|[a-fA-F0-9]{6}$").test(frameOptions.frameColor)
  ) {
    processResult.errors.push("frameColor must be valid hex color string");
    console.error("frameColor must be valid hex color string");
    return false;
  } else return true;
};

/**
 * Constructs the output file
 *
 * @param {string} file - input file name
 * @param {string} output - output folder name
 * @param {string} code - special op code for distinction
 * @returns fully constructed output file path i.e. "./out/edited-[op-code]-[filename]"
 *
 * @private
 */
export const constructOutputPath = (file: string, output: string, code: string) => {
  // Construct the output file
  const defaultFilename = `edited-${code}-${new Date().valueOf()}-${path.basename(file)}`;
  const defaultOutputPath = `${path.dirname(file)}/${defaultFilename}`;

  return output ? `${path.dirname(file)}/${output}/${defaultFilename}` : defaultOutputPath;
};

/**
 * Operation codes
 *
 * @private
 */
export const OPERATION_CODES = {
  addFrame: "afr",
  resize: "rsz",
};
