module.exports = {
  plugins: [
    'preset-default',
    { name: "removeDimensions" },
    { name: "removeXMLNS", active: false },
    { name: "sortAttrs" },
    { name: "removeAttrs", params: { attrs: "stroke" } },
    {
      name: "addAttributesToSVGElement",
      params: { attributes: [{ stroke: "currentColor" }] },
    },
  ],
};
