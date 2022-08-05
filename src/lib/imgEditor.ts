import sharp from "sharp";
import fs from "fs-extra";
import { FrameOptions, PrintPaperOptions, ProcessedImagesInfo } from "./imgEditor.types";
import {
  addFrameFromBuffer,
  addFrameFromListOfFiles,
  checkArguments,
  constructOutputPath,
  OPERATION_CODES,
} from "../utilities/imgEditor.helper";

/**
 * This function adds a frame around the image to change the aspect ratio. </br>
 * This is helpful when the image you are trying to print has different aspect ratio than the printer paper
 * @remarks When buffer is passed as an input this function will return the final, processed image buffer instead of creating a physical file itself
 *
 * @param {string[] | Buffer} input - file names or a Buffer </br> When buffer is passed to this function the "output" is ignored and the final processed image buffer is returned.
 * @param {PrintPaperOptions} printPaperOptions - information about the printing paper
 * @param {FrameOptions} frameOptions - information about the frame color and image position with the frame (image position is currently not used)
 * @param {string} output - output folder
 * @param {number} frameWidthFactor - width of the frame (smallest dimension x frameWidthFactor)
 * @return {Promise<ProcessedImagesInfo>} - Information about the operation
 */
const addFrame = async (
  input: string[] | Buffer,
  printPaperOptions: PrintPaperOptions = {
    printPaperWidth: 4,
    printPaperHeight: 6,
  },
  frameOptions: FrameOptions = { frameColor: "#fff", imagePosition: { x: 0, y: 0 } },
  output: string = ".",
  frameWidthFactor: number = 0.05
): Promise<ProcessedImagesInfo> => {
  // final result
  let result: ProcessedImagesInfo = { data: [], successful: 0, failed: 0, errors: [] };

  if (!checkArguments(input, printPaperOptions, frameOptions, output, result))
    // Validate input arguments
    return result;

  // Create the output folder if it doesn't exist
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }

  if (Buffer.isBuffer(input)) {
    // The input is a buffer
    result = await addFrameFromBuffer(input, printPaperOptions, frameOptions, frameWidthFactor);
  } else if (Array.isArray(input)) {
    // The input is a list of files
    result = await addFrameFromListOfFiles(input, printPaperOptions, frameOptions, output, frameWidthFactor);
  } else {
    // No valid input was found
    const errMsg = "Invalid Input provided. Input can be either a valid image Buffer or a list of input files";
    result.errors.push(errMsg);
    console.error(errMsg);
  }

  return result;
};

/**
 * Resizes given file(s) preserving the aspect ratio
 *
 * @param {string[]} files - list of filenames
 * @param {number | undefined} width - desired output file width
 * @param {boolean} grayscale - if true img will be grayscaled
 * @param {string} output - output folder
 * @returns {Promise<boolean>} true if successful
 */
const resize = async (
  files: string[],
  width: number | undefined = undefined,
  grayscale: boolean = false,
  output: string = "."
): Promise<ProcessedImagesInfo> => {
  const result: ProcessedImagesInfo = { data: [], successful: 0, failed: 0, errors: [] };

  //#region argument checking
  if (!files || (files && files.length === 0)) {
    const errMsg = "No input files found";
    result.errors.push(errMsg);
    console.error(errMsg);
    return result;
  }

  if (width !== undefined && width !== null) {
    if (isNaN(width)) {
      const errMsg = "Width must be a valid integer or (null | undefined)";
      result.errors.push(errMsg);
      console.error(errMsg);
      return result;
    }

    if (width <= 0) {
      const errMsg = "Width must be a valid integer (gt 0)";
      result.errors.push(errMsg);
      console.error(errMsg);
      return result;
    }
  } else if (grayscale === false) {
    const errMsg = "Either 'width' or 'grayscale' should be defined";
    result.errors.push(errMsg);
    console.error(errMsg);
    return result;
  }
  //#endregion

  /** Create the folder if it doesn't exist */
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }

  // process each file
  await files.map(async (file) => {
    // Construct the output file
    const outPath = constructOutputPath(file, output, OPERATION_CODES.resize);

    // start construction of the processing command
    let command = sharp(file);

    // if width arg is provided, resize the image
    if (width !== undefined && width !== null) {
      command = command.resize({ width });
    }

    // if grayscale is provided grayscale the image
    if (grayscale) {
      command = command.grayscale();
    }

    // save to a file
    try {
      const info = await command.toFile(outPath);
      console.info(info);
      result.successful++;
      result.data.push(info);
    } catch (error) {
      // something went wrong
      console.error(error);
      result.errors.push(error as string);
      result.failed++;
    }
  });

  return result;
};

export { addFrame, resize };
