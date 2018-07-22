const code = require("raw-loader!babel-loader!./interceptors/drtv");
const script = document.createElement("script");
script.textContent = code;
