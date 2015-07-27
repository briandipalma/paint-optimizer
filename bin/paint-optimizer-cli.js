#!/usr/bin/env node

"use strict";

require("babel/register");
var optimizer = require("../app/paint-optimizer").default;

var solution = optimizer(process.argv.splice(2));

console.log(solution);
