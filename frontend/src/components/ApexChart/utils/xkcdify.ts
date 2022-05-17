import { D3Selection } from "../types";
import { select } from "d3-selection";

const addFilter = (selection: D3Selection) => {
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

export const xkcdify = (chartDom: HTMLElement, tagToBeAdded: string[]) => {
  const d3Selection = select(chartDom as any).select("svg") as any;
  addFilter(d3Selection);
  const filter = "url(#xkcdify)";
  for (const tag of tagToBeAdded) {
    d3Selection.selectAll(tag).attr("filter", filter);
  }
  d3Selection.selectAll("line").attr("filter", filter);
  d3Selection.selectAll("path").attr("filter", filter);
  d3Selection.selectAll("#apexcharts-grid").attr("filter", filter);
  d3Selection.selectAll("#apexcharts-series").attr("filter", filter);
};
