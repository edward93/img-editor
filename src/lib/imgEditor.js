import sharp from "sharp";
import path from "path";
import fs from "fs-extra";

/**
 *
 * @param {string[]} files
 * @param {*} printPaperOptions
 * @param {*} frameOptions
 * @param {*} output
 * @param {number} frameWidthFactor
 */
export const addFrame = async (
  files,
  printPaperOptions = { printPaperWidth: 4, printPaperHeigh: 6 },
  frameOptions = { frameColor: "#fff", imagePosition: { x: 0, y: 0 } },
  output = ".",
  frameWidthFactor = 0.05
) => {
  // Validate input arguments
  if (
    !checkArguments(
      files,
      (printPaperOptions = { printPaperWidth: 4, printPaperHeigh: 6 }),
      (frameOptions = { frameColor: "#fff", imagePosition: { x: 0, y: 0 } }),
      (output = ".")
    )
  )
    return false;

  /** Create the folder if it doesn't exist */
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output);
  }

  // perform the operation for each file
  files.map(async (file) => {
    //#region prepping necessary data for processing the image
    // Construct the output file
    const defaultFilename = `edited-${new Date().valueOf()}-${path.basename(file)}`;
    const defaultOutputPath = `${path.dirname(file)}/${defaultFilename}`;

    const outPath = output ? `${path.dirname(file)}/${output}/${defaultFilename}` : defaultOutputPath;

    // get information about the current file
    const { width, height } = await sharp(file).metadata();

    // get frame measurements
    const { top, left, right, bottom } = calculateFrameSizes(width, height, printPaperOptions, frameWidthFactor);
    //#endregion

    //#region processing the image
    // edit the image
    try {
      //TODO: save each image to file async
      const result = await sharp(file)
        .extend({
          top,
          left,
          right,
          bottom,
          background: frameOptions.frameColor,
        })
        .toFile(outPath);

      console.info(result);
      return true;
    } catch (error) {
      // something went wrong
      console.error(error);
      return false;
    }
    //#endregion
  });
};

//#region private/helper methods
/**
 *
 * @param {*} width
 * @param {*} height
 * @param {*} printPaperOptions
 * @param {*} frameWidthFactor
 * @returns
 */
const calculateFrameSizes = (width, height, printPaperOptions, frameWidthFactor) => {
  const outputAspectRatio =
    width < height
      ? printPaperOptions.printPaperWidth / printPaperOptions.printPaperHeigh
      : printPaperOptions.printPaperHeigh / printPaperOptions.printPaperWidth;

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

  return { top, left, right, bottom };
};
/**
 *
 * @param {*} files
 * @param {*} printPaperOptions
 * @param {*} frameOptions
 * @param {*} output
 * @returns
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
  } else if (frameOptions.frameColor === undefined || frameOptions.frameColor === null) {
    console.error("frameColor must be valid hex color string");
    return false;
  } else return true;
};

//#endregion
