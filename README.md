# img-editor

[![npm (scoped)](https://img.shields.io/npm/v/@edward1993/img-editor?style=flat-square)](https://www.npmjs.com/package/@edward1993/img-editor)
[![Build Status](https://github.com/edward93/img-editor/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/edward93/img-editor/actions/workflows/npm-publish.yml)
[![CI](https://github.com/edward93/img-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/edward93/img-editor/actions/workflows/ci.yml)

### Compact library to edit images

_NOTE:_ This tool uses `sharp` for image manipulation. More info <a href="https://github.com/lovell/sharp" target="blank">here</a>

# Table of Contents

- [Announcements](#announcements)
- [Installation](#installation)
  - [CLI](#cli)
  - [Module](#module)
- [Usage](#usage)
- [Examples](#examples)
  - [resize](#resize)
  - [addFrame](#addframe)
- [Future Enhancements](#future-enhancements)
- [Documentation](#documentation)
- [Limitations](#limitations)

## Announcements!

**Buffer input** is currently supported for (`addFrame`) (v2.0.0) </br>
**WARNING** This version contains some breaking changes.
Please check the [release notes](docs/releaseNotes.md) for detailed information </br>

- Return objects were changed, now both functions return an [object](docs/md/modules/imgEditor_types.md#processedimagesinfo) instead of `boolean`
- `addFrame` (`frame`) now supports buffer input. This allows to process and return buffers instead of reading from a file. This, unfortunately, only supports a single file

## Installation

### CLI

```bash
npm i -g @edward1993/img-editor
```

### Module

```bash
npm i @edward1993/img-editor
```

```js
import { resize } from "@edward1993/img-editor/dist/lib/imgEditor";
import { addFrame } from "@edward1993/img-editor/dist/lib/imgEditor";
```

## Usage

```bash
# Resize images
img-editor resize [options]

Options:
      --version    Show version number                                 [boolean]
  -f, --files      file or glob                              [string] [required]
  -w, --width      width of the output image in pixels                  [number]
  -g, --grayscale  Convert to grayscale               [boolean] [default: false]
  -o, --output     Output folder                         [string] [default: "."]
  -h, --help       Show help                                           [boolean]

Examples:
  img-editor resize -f ./img.png -w 25 -g

Copyright 2022 - Present

# Add a frame
img-editor frame [options]

Options:
      --version            Show version number                         [boolean]
  -f, --files              files or glob                     [string] [required]
  -w, --paperWidth         printing paper width          [number] [default: "4"]
      --paperHeight, --ph  printing paper height         [number] [default: "6"]
  -c, --frameColor         frame color, i.e. "#fff"   [string] [default: "#fff"]
  -o, --output             Output folder                 [string] [default: "."]
  -h, --help               Show help                                   [boolean]

Examples:
  img-editor frame -f ./img.png

Copyright 2022 - Present
```

## Examples

Currently there are only 2 existing functionalities `resize` and `addFrame`. </br>

### resize

This function is fairly straight forward
`resize` can be used (especially the **cli** version) to bulk resize and grayscale large datasets to prepare them for ML training.

```bash
img-editor resize -f ./input/*.png -w 25 -g -o ./out/
```

In this example all `.png` files will be resized to `25px` and whatever the height is going to end up being, `grayscaled` and put in `./out` folder

### addFrame

This function was created mainly for one reason: to change aspect ratio of the input image. </br>
The reason one might want to do that, is say the picture you are trying to print doesn't fit on the printing paper, in which case you need to crop the image. </br>
This may lead to undesired results so the solution is to prepare the image, in a 3rd party photo editing app either by cropping it or adding a frame manually. </br>
This tool was made to do just that on a large set of files.

#### Cli example

```bash
img-editor frame -f ./input/*.png -w 6 --ph 4 -o ./output
```

This will take all the `.png` files in `input` folder, add a `white` frame around them and save them to `./output` folder </br>
**Note** It will automatically determine the aspect ratio and orientation of an input image so there is no need to worry about mixing `-w` and `-ph` options. </br>
**Note** `-w` and `--ph` options are `unitless`, it is only used to calculate the `aspect ratio` of the output image, so you can insert your paper dimensions in `cm` or `in` </br>

#### Functional example

`v2.0.0` allows to pass a buffer to `addFrame` function and receive an object that contains a buffer of the final image.

```js
import { addFrame } from "@edward1993/img-editor/dist/lib/imgEditor";
import fs from "fs-extra";

// read file into a buffer
const file = await fs.readFile("./input.png");

// pass the buffer to process it
// result.data[0] is the edited image
const result = await addFrame(file);

// write to a file
await fs.writeFile("./out.png", result.data[0]);

console.log(result);
/* console output
Data:  {
  data: [
    <Buffer ff d8 ff e1 00 bc 45 78 69 66 00 00 49 49 2a 00 08 00 00 00 06 00 12 01 03 00 01 00 00 00 01 00 00 00 1a 01 05 00 01 00 00 00 56 00 00 00 1b 01 05 00 ... 3355222 more bytes>
  ],
  successful: 1,
  failed: 0,
  errors: []
}
*/
```

Of course `filename` can be directly passed as well.

```js
import { addFrame } from "@edward1993/img-editor/dist/lib/imgEditor";
import fs from "fs-extra";

// pass the file to process it
const result = await addFrame("./input.png");
// new, updated file will be saved to ./edited-afr-1658894097715-input.png
```

![InputImage](/docs/media/img-demo.png)


## Future Enhancements

- Add buffer support for `resize` function
- Add support accepting multiple buffers instead of one
- Add ability to control the placement of the image within the frame
- Add ability to have more control over the output file names

## Documentation

- API docs [here](docs/md/modules/imgEditor.md)
- Release Notes [here](docs/releaseNotes.md)

## Limitations

Currently supported image formats are **JPEG, PNG, WebP, GIF, SVG, TIFF**
