const path = require("path");

module.exports = {
  context: path.join(__dirname, "src"),
  entry: {
    background: "./background",
    netflix: "./netflix",
    hbonordic: "./hbonordic",
    html5: "./html5",
    popup: "./Popup"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    loaders: [
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
