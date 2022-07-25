import sharp from "sharp";
import path from "path";
import fs from "fs-extra";

/**
 * @typedef {Object} PrintPaperOptionsType - Information about the printing paper
 * @property {number} printPaperWidth - Width of the printing paper
 * @property {number} printPaperHeigh - Height of the printing paper
 */

/**
 * @typedef {Object} FrameOptionsType - Information about the printing paper
 * @property {string} frameColor - Width of the printing paper
 * @property {object} imagePosition - Position of the image
 */

/**
 * This function adds a frame around the image to change the aspect ratio. </br>
 * This is helpful when the image you are trying to print has different aspect ratio than the printer paper
 *
 * @param {string[]} files - glob, file names
 * @param {PrintPaperOptionsType} printPaperOptions - information about the printing paper
 * @param {FrameOptionsType} frameOptions - information about the frame color and image position with the frame (image position is currently not used)
 * @param {string} output - output folder
 * @param {number} frameWidthFactor - width of the frame (smallest dimension x frameWidthFactor)
 * @return {Promise<boolean>} True if successful
 */
const addFrame = async (
  files,
  printPaperOptions = { printPaperWidth: 4, printPaperHeigh: 6 },
  frameOptions = { frameColor: "#fff", imagePosition: { x: 0, y: 0 } },
  output = ".",
  frameWidthFactor = 0.05
) => {
  // Validate input arguments
  if (!checkArguments(files, printPaperOptions, frameOptions, output)) return false;

  // Create the output folder if it doesn't exist
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }

  const result = { successfullyEdited: 0, failed: 0 };

  // perform the operation for each file
  await files.map(async (file) => {
    //#region prepping necessary data for processing the image
    // Construct the output file
    const outPath = constructOutputPath(file, output, OPERATION_CODES.addFrame);

    // get information about the current file
    const { width, height } = await sharp(file).metadata();

    // get frame measurements
    const { top, left, right, bottom } = calculateFrameSizes(width, height, printPaperOptions, frameWidthFactor);
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
      result.successfullyEdited++;
      return true;
    } catch (error) {
      // something went wrong
      console.error(error);
      result.failed++;
      return false;
    }
    //#endregion
  });

  return result.failed === 0;
};

/**
 * Resizes given file(s) preserving the aspect ratio
 *
 * @param {string} files - file or glob
 * @param {number} width - desired output file width
 * @param {boolean} grayscale - if true img will be grayscaled
 * @param {string} output - output folder
 * @returns {Promise<boolean>} true if successful
 */
const resize = async (files, width = undefined, grayscale = false, output = ".") => {
  //#region argument checking
  if (!files || (files && files.length === 0)) {
    console.error("No files found");
    return false;
  }

  if (width !== undefined && width !== null) {
    if (isNaN(width)) {
      console.error("Width must be a valid integer or (null | undefined)");
      return false;
    }

    if (width <= 0) {
      console.error("Width must be a valid integer (gt 0)");
      return false;
    }
  } else if (grayscale === false) {
    console.error("Either 'width' or 'grayscale' should be defined");
    return false;
  }
  //#endregion

  /** Create the folder if it doesn't exist */
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }

  const result = { successfullyEdited: 0, failed: 0 };

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
      result.successfullyEdited++;
      return true;
    } catch (error) {
      console.error(error);
      result.failed++;
      return false;
    }
  });

  return result.failed === 0;
};

//#region private/helper methods
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
const calculateFrameSizes = (width, height, printPaperOptions, frameWidthFactor) => {
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
 * @param {string[]} files - glob, file names
 * @param {PrintPaperOptionsType} printPaperOptions - information about the printing paper
 * @param {{frameColor: string, imagePosition: {x: number, y: number}}} frameOptions - information about the frame color and image position with the frame (image position is currently not used)
 * @param {string} output - output folder
 * @returns True if arguments are OK
 *
 * @private
 */
const checkArguments = (
  files,
  printPaperOptions = { printPaperWidth: 4, printPaperHeigh: 6 },
  frameOptions = { frameColor: "#fff", imagePosition: { x: 0, y: 0 } },
  output = "."
) => {
  if (!files || (files && files.length === 0)) {
    console.error("No files found");
    return false;
  } else if (
    printPaperOptions.printPaperWidth === undefined ||
    printPaperOptions.printPaperHeigh === undefined ||
    printPaperOptions.printPaperWidth === null ||
    printPaperOptions.printPaperHeigh === null ||
    isNaN(printPaperOptions.printPaperWidth) ||
    isNaN(printPaperOptions.printPaperHeigh)
  ) {
    console.error(`printPaperWidth and printPaperHeight must be specified and valid numbers`);
    return false;
  } else if (
    frameOptions.frameColor === undefined ||
    frameOptions.frameColor === null ||
    !new RegExp("^#([a-fA-F0-9]){3}$|[a-fA-F0-9]{6}$").test(frameOptions.frameColor)
  ) {
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
const constructOutputPath = (file, output, code) => {
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
const OPERATION_CODES = {
  addFrame: "afr",
  resize: "rsz",
};
//#endregion

export { addFrame, resize };
