/* eslint-disable @typescript-eslint/no-var-requires */

const ProgressBarPlugin = require("progress-bar-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");


module.exports = {
  entry: {
    background: "./src/background",
    popup: "./src/popup",
    netflix: "./src/content/netflix",
    hbonordic: "./src/content/hbonordic",
    viaplay: "./src/content/viaplay",
    filmcentralen: "./src/content/filmcentralen",
    mitcfu: "./src/content/mitcfu",
    drtv: "./src/content/drtv",
    urplay: "./src/content/urplay",
    filmochskola: "./src/content/filmochskola",
  },
  mode: "production",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    modules: ["node_modules"],
  },
  node: {
    fs: "empty",
  },
  output: {
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/env",
                  {
                    targets: {
                      browsers: ["last 5 Chrome versions"],
                    },
                    modules: false,
                    loose: true,
                  },
                ],
                "@babel/react",
              ],
              plugins: ["lodash"],
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/env",
                  {
                    targets: {
                      browsers: ["last 5 Chrome versions"],
                    },
                    modules: false,
                    loose: true,
                  },
                ],
                "@babel/react",
                "@babel/typescript",
              ],
              plugins: ["lodash"],
            },
          },
        ],
      },
    ],
  },
  performance: {
    hints: false,
  },
  plugins: [
    new CopyPlugin([
      {
        from: "assets",
        to: ".",
      },
    ]),
    new ProgressBarPlugin(),
  ],
};
