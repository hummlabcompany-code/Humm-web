"use client";

import type { ModelViewerElement } from "@google/model-viewer";
import { createElement, useEffect, useRef, useState } from "react";

type ModelViewerAttributes = React.HTMLAttributes<HTMLElement> & {
  src: string;
  poster?: string;
  alt: string;
  ar: boolean;
  "ios-src"?: string;
  "ar-modes": string;
  "ar-scale": string;
  "ar-placement": string;
  "xr-environment": boolean;
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
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  useEffect(() => {
    let mounted = true;
    import("@google/model-viewer").then(() => { if (mounted) setRegistered(true); }).catch(() => onErrorRef.current());
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!registered) return;
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => onReadyRef.current();
    const handleError = () => onErrorRef.current();
    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("error", handleError);
    if (viewer.loaded) handleLoad();

    return () => {
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, [registered, src]);

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
    "ar-scale": "fixed",
    "ar-placement": "floor",
    "xr-environment": true,
    "camera-controls": true,
    "auto-rotate": active,
    "shadow-intensity": lit ? "0.7" : "1.25",
    "shadow-softness": "0.9",
    exposure: lit ? "1.35" : "0.9",
    "environment-image": "neutral",
    "interaction-prompt": "auto",
    "touch-action": "pan-y",
    reveal: "auto",
  };

  return createElement("model-viewer", { ...attributes, ref: viewerRef });
}
