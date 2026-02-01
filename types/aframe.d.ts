import type { HTMLAttributes } from "react";

type AFrameElementProps = HTMLAttributes<HTMLElement> & Record<string, unknown>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "a-scene": AFrameElementProps;
      "a-entity": AFrameElementProps;
      "a-sphere": AFrameElementProps;
      "a-camera": AFrameElementProps;
      "a-box": AFrameElementProps;
      "a-cylinder": AFrameElementProps;
      "a-plane": AFrameElementProps;
      "a-sky": AFrameElementProps;
    }
  }
}
