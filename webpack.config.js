const path = require("path")

module.exports = {
  context: path.join(__dirname, "src"),
  entry: {
    background: "./background",
    netflix: "./netflix",
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
        loader: "babel",
        test: /.js$/,
        include: path.join(__dirname, "src"),
        query: {
          presets: ["es2015", "react", "stage-2"]
        }
      }
    ]
  }
}
