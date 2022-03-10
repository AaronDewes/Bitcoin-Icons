module.exports = {
  plugins: [
    'preset-default',
    { name: "removeDimensions" },
    { name: "removeXMLNS", active: false },
    { name: "sortAttrs" },
    { name: "removeAttrs", params: { attrs: "fill" } },
    {
      name: "addAttributesToSVGElement",
      params: { attributes: [{ fill: "currentColor" }] },
    },
  ],
};
