#!/usr/bin/env node
require = require("esm")(module /*, options*/);
const glob = require("glob");
const imgEditor = require("./lib/imgEditor");

const argv = require("yargs")
  .usage("$0 <command> [options]")
  .command("frame", "adds frame to the image", function (yargs) {
    return yargs
      .usage("$0 frame [options]")
      .example("$0 frame -f ./img.png")
      .option("files", {
        alias: "f",
        describe: "files or glob",
        demandOption: true,
        type: "string",
      })
      .option("paperWidth", {
        alias: "w",
        describe: "printing paper width",
        demandOption: false,
        default: "4",
        type: "number",
      })
      .option("paperHeight", {
        alias: "ph",
        describe: "printing paper height",
        demandOption: false,
        default: "6",
        type: "number",
      })
      .option("frameColor", {
        alias: "c",
        describe: "frame color, i.e. #fff",
        demandOption: false,
        default: "#fff",
        type: "string",
      })
      .option("output", {
        alias: "o",
        describe: "Output folder",
        demandOption: false,
        default: ".",
        type: "string",
      })
      .help("h")
      .alias("h", "help");
  })
  .help("h")
  .alias("h", "help")
  .epilog(`Copyright ${new Date().getFullYear()}`).argv;

// console.log(argv);
//TODO: refactor this to make it more readable and better
if (argv._[0] === "frame") {
  glob(argv.files, (err, files) => {
    if (err) {
      console.error(err);
      return 1;
    } else {
      if (files.length === 0) {
        console.error("No files found");
        return 1;
      }
      return imgEditor.addFrame(
        files,
        { printPaperWidth: argv.paperWidth, printPaperHeigh: argv.paperHeight },
        { frameColor: argv.frameColor },
        argv.output
      );
    }
  });
} else if (argv._[0] === "resize") {
  glob(argv.file, (err, files) => {
    if (err) {
      console.error(err);
      return 1;
    } else {
      if (files.length === 0) {
        console.error("No files found");
        return 1;
      }
      return imgEditor.resize(files, argv.width, argv.grayscale, argv.output);
    }
  });
}
