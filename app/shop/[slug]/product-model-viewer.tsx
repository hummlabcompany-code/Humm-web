"use client";

import type { ModelViewerElement } from "@google/model-viewer";
import { createElement, useEffect, useState } from "react";

type ModelViewerAttributes = React.HTMLAttributes<HTMLElement> & {
  src: string;
  poster?: string;
  alt: string;
  ar: boolean;
  "ios-src"?: string;
  "ar-modes": string;
  "camera-controls": boolean;
  "auto-rotate": boolean;
  "shadow-intensity": string;
  "shadow-softness": string;
  exposure: string;
  "environment-image": string;
  "interaction-prompt": string;
  "touch-action": string;
  reveal: string;
};

export type HummModelViewerElement = ModelViewerElement;

export default function ProductModelViewer({
  id,
  src,
  iosSrc,
  poster,
  alt,
  lit,
  active,
  onReady,
  onError,
}: {
  id: string;
  src: string;
  iosSrc?: string;
  poster?: string;
  alt: string;
  lit: boolean;
  active: boolean;
  onReady: () => void;
  onError: () => void;
}) {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    let mounted = true;
    import("@google/model-viewer").then(() => { if (mounted) setRegistered(true); }).catch(onError);
    return () => { mounted = false; };
  }, [onError]);

  if (!registered) return <div className="model-loading" role="status">Đang chuẩn bị mô hình 3D…</div>;

  const attributes: ModelViewerAttributes = {
    id,
    className: `product-model-viewer ${lit ? "is-lit" : ""}`,
    src,
    poster,
    alt,
    ar: true,
    "ios-src": iosSrc,
    "ar-modes": "webxr scene-viewer quick-look",
    "camera-controls": true,
    "auto-rotate": active,
    "shadow-intensity": lit ? "0.7" : "1.25",
    "shadow-softness": "0.9",
    exposure: lit ? "1.35" : "0.9",
    "environment-image": "neutral",
    "interaction-prompt": "auto",
    "touch-action": "pan-y",
    reveal: "auto",
    onLoad: onReady,
    onError,
  };

  return createElement("model-viewer", attributes);
}
