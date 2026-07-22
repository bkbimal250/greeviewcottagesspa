"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
  wide: 1536,
} as const;

export type BreakpointName =
  keyof typeof BREAKPOINTS;

interface ResponsiveState {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isLaptop: boolean;
  isDesktop: boolean;
  isWide: boolean;
  isTouchDevice: boolean;
  orientation: "portrait" | "landscape";
}

function getWindowSize(): Pick<
  ResponsiveState,
  "width" | "height"
> {
  if (typeof window === "undefined") {
    return {
      width: 0,
      height: 0,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getResponsiveState(): ResponsiveState {
  const { width, height } = getWindowSize();

  const isTouchDevice =
    typeof window !== "undefined" &&
    (
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );

  return {
    width,
    height,
    isMobile:
      width > 0 &&
      width < BREAKPOINTS.tablet,
    isTablet:
      width >= BREAKPOINTS.tablet &&
      width < BREAKPOINTS.laptop,
    isLaptop:
      width >= BREAKPOINTS.laptop &&
      width < BREAKPOINTS.desktop,
    isDesktop:
      width >= BREAKPOINTS.desktop,
    isWide:
      width >= BREAKPOINTS.wide,
    isTouchDevice,
    orientation:
      height > width
        ? "portrait"
        : "landscape",
  };
}

export function useResponsive(): ResponsiveState {
  const [viewport, setViewport] =
    useState<ResponsiveState>(
      getResponsiveState,
    );

  useEffect(() => {
    let animationFrameId: number | null =
      null;

    const handleResize = () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(
          animationFrameId,
        );
      }

      animationFrameId =
        window.requestAnimationFrame(() => {
          setViewport(getResponsiveState());
        });
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize,
    );

    window.addEventListener(
      "orientationchange",
      handleResize,
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize,
      );

      window.removeEventListener(
        "orientationchange",
        handleResize,
      );

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(
          animationFrameId,
        );
      }
    };
  }, []);

  return useMemo(
    () => viewport,
    [viewport],
  );
}

export function useMediaQuery(
  query: string,
): boolean {
  const [matches, setMatches] =
    useState(() =>
      typeof window === "undefined"
        ? false
        : window.matchMedia(query).matches,
    );

  useEffect(() => {
    const mediaQuery =
      window.matchMedia(query);
    const animationFrameId: number =
      window.requestAnimationFrame(() => {
        setMatches(mediaQuery.matches);
      });

    const handleChange = (
      event: MediaQueryListEvent,
    ) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener(
      "change",
      handleChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleChange,
      );

      window.cancelAnimationFrame(
        animationFrameId,
      );
    };
  }, [query]);

  return matches;
}

export function useBreakpoint(
  breakpoint: BreakpointName,
): boolean {
  return useMediaQuery(
    `(min-width: ${BREAKPOINTS[breakpoint]}px)`,
  );
}

export default useResponsive;
