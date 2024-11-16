/* global require */
const gulp = require("gulp");
const del = require("del");
const shell = require("gulp-shell");

// Clean task
gulp.task("clean", function (done) {
  del.deleteSync([
    "dist/**",
    "!dist/.clasp*.json",
    "!dist/appsscript.json",
    "!dist/.placeholder",
    // just for safety...
    "!dist/creds.json",
    "build",
  ]);
  done();
});

// Compile task
gulp.task(
  "compile",
  shell.task([
    "npx tsc",
    "mkdir -p dist",
    // in case of problems with Google Apps Script dealing with loading order
    // switch to --input build/code.ts --single-output dist/code.js
    "./tools/merger --input build/ --multi-output dist",
  ])
);

// Build task
gulp.task("build", gulp.series("clean", "compile"));
gulp.task("__push", shell.task(["npx clasp push"], { cwd: "dist" }));
gulp.task("push", gulp.series("build", "__push"));
