import {
  createSlot
} from "./chunk-ZTU7P5WF.js";
import {
  require_react_dom
} from "./chunk-QFMFQ3UP.js";
import "./chunk-RYRAFWSM.js";
import {
  require_jsx_runtime
} from "./chunk-HQEOAY23.js";
import {
  require_react
} from "./chunk-YBJJY3M3.js";
import {
  __toESM
} from "./chunk-G3PMV62Z.js";

// ../../node_modules/@radix-ui/react-aspect-ratio/dist/index.mjs
var React2 = __toESM(require_react(), 1);

// ../../node_modules/@radix-ui/react-aspect-ratio/node_modules/@radix-ui/react-primitive/dist/index.mjs
var React = __toESM(require_react(), 1);
var ReactDOM = __toESM(require_react_dom(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var NODES = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
];
var Primitive = NODES.reduce((primitive, node) => {
  const Slot = createSlot(`Primitive.${node}`);
  const Node = React.forwardRef((props, forwardedRef) => {
    const { asChild, ...primitiveProps } = props;
    const Comp = asChild ? Slot : node;
    if (typeof window !== "undefined") {
      window[/* @__PURE__ */ Symbol.for("radix-ui")] = true;
    }
    return (0, import_jsx_runtime.jsx)(Comp, { ...primitiveProps, ref: forwardedRef });
  });
  Node.displayName = `Primitive.${node}`;
  return { ...primitive, [node]: Node };
}, {});

// ../../node_modules/@radix-ui/react-aspect-ratio/dist/index.mjs
var import_jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
var NAME = "AspectRatio";
var AspectRatio = React2.forwardRef(
  (props, forwardedRef) => {
    const { ratio = 1 / 1, style, ...aspectRatioProps } = props;
    return (0, import_jsx_runtime2.jsx)(
      "div",
      {
        style: {
          // ensures inner element is contained
          position: "relative",
          // ensures padding bottom trick maths works
          width: "100%",
          paddingBottom: `${100 / ratio}%`
        },
        "data-radix-aspect-ratio-wrapper": "",
        children: (0, import_jsx_runtime2.jsx)(
          Primitive.div,
          {
            ...aspectRatioProps,
            ref: forwardedRef,
            style: {
              ...style,
              // ensures children expand in ratio
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0
            }
          }
        )
      }
    );
  }
);
AspectRatio.displayName = NAME;
var Root = AspectRatio;
export {
  AspectRatio,
  Root
};
//# sourceMappingURL=@radix-ui_react-aspect-ratio.js.map
