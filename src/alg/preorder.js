var dfs = require("./dfs");

function preorder(g, vs) {
  return dfs(g, vs, "pre");
}

module.exports = preorder;
