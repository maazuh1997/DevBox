import React from "react";

globalThis.Globe = function Globe(props){
  return React.createElement("svg",{...props,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},
    React.createElement("circle",{cx:"12",cy:"12",r:"10"}),
    React.createElement("line",{x1:"2",y1:"12",x2:"22",y2:"12"}),
    React.createElement("path",{d:"M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"})
  );
};
