import { createContext, useContext } from "react";

// Пиксельная тема: панели с жёсткими краями и тенью «как в 8-битной игре»
export const PixelCtx = createContext(false);
export const usePixel = () => useContext(PixelCtx);
