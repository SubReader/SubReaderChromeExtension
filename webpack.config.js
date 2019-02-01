const path = require("path");

module.exports = {
  context: path.join(__dirname, "src"),
  entry: {
    background: "./background",
    netflix: "./netflix",
    hbonordic: "./hbonordic",
    viaplay: "./viaplay",
    filmcentralen: "./filmcentralen",
    drtv: "./drtv",
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
          presets: [
            [
              "@babel/preset-env",
              {
                targets: {
                  browsers: ["last 5 Chrome versions"]
                },
                modules: false,
                loose: true
              }
            ],
            "@babel/preset-react"
          ],
          plugins: [
            [
              "@babel/plugin-proposal-object-rest-spread",
              {
                useBuiltIns: true
              }
            ]
          ]
        }
      }
    ]
  }
};
