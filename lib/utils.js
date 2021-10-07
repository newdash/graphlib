const { constant } = require("@newdash/newdash/constant");
const { isFunction } = require("@newdash/newdash/isFunction");
const { filter } = require("@newdash/newdash/filter");
const { isEmpty } = require("@newdash/newdash/isEmpty");
const { keys } = require("@newdash/newdash/keys");
const { values } = require("@newdash/newdash/values");
const { union } = require("@newdash/newdash/union");
const { each } = require("@newdash/newdash/each");
const { has } = require("@newdash/newdash/has");
const { reduce } = require("@newdash/newdash/reduce");
const { isArray } = require("@newdash/newdash/isArray");
const { isUndefined } = require("@newdash/newdash/isUndefined");
const { map } = require("@newdash/newdash/map");
const { size } = require("@newdash/newdash/size");
const { transform } = require("@newdash/newdash/transform");
const { clone } = require("@newdash/newdash/clone");


const utils = {
  clone,
  constant,
  each,
  filter,
  has,
  isArray,
  isEmpty,
  isFunction,
  isUndefined,
  keys,
  map,
  reduce,
  size,
  transform,
  union,
  values,
};

module.exports = utils;
