var dfs = require("./dfs");

function postorder(g, vs) {
  return dfs(g, vs, "post");
}

module.exports = postorder;
