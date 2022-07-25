# img-editor
![npm (scoped)](https://img.shields.io/npm/v/@edward1993/img-editor?style=flat-square)
![Build Status](https://github.com/edward93/img-editor/actions/workflows/npm-publish.yml/badge.svg)

Compact library to edit images

_NOTE:_ This tool uses `sharp` for image manipulation. More info <a href="https://github.com/lovell/sharp" target="blank">here</a>

## Install (CLI)

```bash
npm i -g @edward1993/img-editor
```

## Install (Module)

```bash
npm i @edward1993/img-editor
```

```js
import { resize } from "img-editor/lib";
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
  -c, --frameColor         frame color, i.e. "#fff"     [string] [default: "#fff"]
  -o, --output             Output folder                 [string] [default: "."]
  -h, --help               Show help                                   [boolean]

Examples:
  img-editor frame -f ./img.png

Copyright 2022 - Present
```

### Documentation

- API docs [here](docs/md/api.md)

## Limitations

Currently supported image formats are **JPEG, PNG, WebP, GIF, SVG, TIFF**
