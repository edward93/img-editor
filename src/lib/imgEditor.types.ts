/**
 * Information about processed images
 */
 export type ProcessedImagesInfo = {
  /**
   * Array of buffers or filenames
   */
  data: any[];
  /**
   * Number of successfully edited images
   */
  successful: number;
  /**
   * Number of failed edits
   */
  failed: number;
  /**
   * Error messages
   */
  errors: string[];
};

/**
 * Information about the printing paper
 */
export type PrintPaperOptions = {
  /**
   * Width of the printing paper
   */
  printPaperWidth: number;

  /**
   * Height of the printing paper
   */
  printPaperHeight: number;
};

/**
 * Information about the frame
 */
export type FrameOptions = {
  /**
   * Width of the printing paper
   */
  frameColor: string;

  /**
   * Position of the image
   */
  imagePosition: object;
};