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
      result.errors.push(error as string);
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
    result.errors.push(error as string);
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
  //TODO: simplify this function


  // TODO: this assumes the orientation of the paper. Should be either the matching dimensions or
  // ? Max(printPaperOptions.printPaperWidth, printPaperOptions.printPaperWidth) / Min(printPaperOptions.printPaperWidth, printPaperOptions.printPaperWidth)
  // : Min(printPaperOptions.printPaperWidth, printPaperOptions.printPaperWidth) / Max(printPaperOptions.printPaperWidth, printPaperOptions.printPaperWidth)
  const outputAspectRatio =
    width > height
      ? printPaperOptions.printPaperWidth / printPaperOptions.printPaperHeight
      : printPaperOptions.printPaperHeight / printPaperOptions.printPaperWidth;

  let top,
    left,
    right,
    bottom = 0;

  // aspect ratio of the input file
  const inputAspectRatio = width / height;

  if (width >= height) {
    // landscape or square mode
    const frameThickness = Math.round(height * frameWidthFactor);
    let outputWidth = 0;
    let outputHeight = 0;

    if (outputAspectRatio >= inputAspectRatio) {
      // calculate the output height first
      outputHeight = height + 2 * frameThickness;
      outputWidth = outputHeight * outputAspectRatio;
    } else {
      // calculate the output width first
      outputWidth = width + 2 * frameThickness;
      outputHeight = outputWidth / outputAspectRatio;
    }
    // calculate frame size
    const verticalFrameThickness = Math.round((outputHeight - height) / 2);
    const horizontalFrameThickness = Math.round((outputWidth - width) / 2);

    top = verticalFrameThickness;
    left = horizontalFrameThickness;
    right = horizontalFrameThickness;
    bottom = verticalFrameThickness;
  } else {
    // portrait
    const frameThickness = Math.round(width * frameWidthFactor);

    let outputWidth = 0;
    let outputHeight = 0;
    if (outputAspectRatio >= inputAspectRatio) {
      // input image is taller than the output
      // calculate the output height first
      outputHeight = height + 2 * frameThickness;
      outputWidth = outputHeight * outputAspectRatio;
    } else {
      // calculate the output width first
      outputWidth = width + 2 * frameThickness;
      outputHeight = outputWidth / outputAspectRatio;
    }

    const horizontalFrameThickness = Math.round((outputWidth - width) / 2);

    // calculate frame size
    top = frameThickness;
    left = horizontalFrameThickness;
    right = horizontalFrameThickness;
    bottom = outputHeight - height - frameThickness;
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
  printPaperOptions: PrintPaperOptions,
  frameOptions: FrameOptions,
  output: string,
  processResult: ProcessedImagesInfo
) => {
  if (!input || (input && input.length === 0)) {
    const errMsg = "No input files found";
    processResult.errors.push(errMsg);
    console.error(errMsg);
    return false;
  } else if (
    printPaperOptions.printPaperWidth === undefined ||
    printPaperOptions.printPaperHeight === undefined ||
    printPaperOptions.printPaperWidth === null ||
    printPaperOptions.printPaperHeight === null ||
    isNaN(printPaperOptions.printPaperWidth) ||
    isNaN(printPaperOptions.printPaperHeight)
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
