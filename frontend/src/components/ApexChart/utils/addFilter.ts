import { D3Selection } from "../types";

export default (selection: D3Selection) => {
  selection
    .append("defs")
    .append("filter")
    .attr("id", "xkcdify")
    .attr("filterUnits", "userSpaceOnUse")
    .call((f) => {
      f.append("feTurbulence")
        .attr("type", "fractalNoise")
        .attr("baseFrequency", "0.05")
        .attr("result", "noise");
      f.append("feDisplacementMap")
        .attr("scale", "5")
        .attr("xChannelSelector", "R")
        .attr("yChannelSelector", "G")
        .attr("in", "SourceGraphic")
        .attr("in2", "noise");
    });
};

export const a = (selection: D3Selection) => {
  selection.select("filter").remove();
};
