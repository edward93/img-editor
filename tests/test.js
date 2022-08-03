#!/usr/bin/env node
require = require("esm")(module /*, options*/);
var imgEditor = require("./lib/imgEditor");
var fs = require("fs-extra");

fs.readFile("./LandscapePic.jpg").then((imgBuffer) => {
  imgEditor.addFrame(imgBuffer).then((result) => {
    console.log("Image was processed");
    console.log("Data: ", result);
    fs.writeFile("tmp.jpg", result.data[0]);
  });
});
