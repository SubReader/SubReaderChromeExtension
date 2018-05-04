const path = require("path");

module.exports = {
  context: path.join(__dirname, "src"),
  entry: {
    background: "./background",
    netflix: "./netflix",
    hbonordic: "./hbonordic",
    viaplay: "./viaplay",
    html5: "./html5",
    popup: "./Popup"
  },
  mode: "production",
  node: {
    fs: "empty"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /.js$/,
        include: path.join(__dirname, "src"),
        loader: "babel-loader",
        options: {
          presets: ["env", "react"]
        }
      }
    ]
  }
};
