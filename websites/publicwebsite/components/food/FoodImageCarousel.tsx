"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import { getImageUrl } from "@/lib/utils/images";
import type { FoodItem } from "@/types/food";

interface FoodImageCarouselProps {
  food: FoodItem;
  fallbackIndex?: number;
  aspectClassName?: string;
  imageClassName?: string;
  showControls?: boolean;
  showCounter?: boolean;
  autoPlay?: boolean;
  autoPlayDelay?: number;
}

const fallbackImages = [
  "/images/bg2.webp",
  "/images/property-hero-placeholder.webp",
  "/images/property-about-placeholder.webp",
];

export function getFoodImages(
  food: FoodItem,
  fallbackIndex = 0,
): string[] {
  const rawImages = [
    food.primary_image,
    ...(Array.isArray(food.image_list)
      ? food.image_list
      : []),
  ];

  const images = rawImages
    .map((image) => getImageUrl(image))
    .filter(
      (image): image is string =>
        typeof image === "string" &&
        image.trim().length > 0,
    );

  const uniqueImages = Array.from(new Set(images));

  if (uniqueImages.length > 0) {
    return uniqueImages;
  }

  return [
    fallbackImages[
      fallbackIndex % fallbackImages.length
    ],
  ];
}

export default function FoodImageCarousel({
  food,
  fallbackIndex = 0,
  aspectClassName = "aspect-[4/3]",
  imageClassName = "",
  showControls = false,
  showCounter = true,
  autoPlay = true,
  autoPlayDelay = 3500,
}: FoodImageCarouselProps) {
  const images = useMemo(
    () => getFoodImages(food, fallbackIndex),
    [food, fallbackIndex],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const hasManyImages = images.length > 1;
  const visibleIndex = activeIndex % images.length;

  useEffect(() => {
    if (
      !autoPlay ||
      !hasManyImages ||
      isPaused ||
      autoPlayDelay <= 0
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % images.length,
      );
    }, autoPlayDelay);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    autoPlay,
    autoPlayDelay,
    hasManyImages,
    images.length,
    isPaused,
  ]);

  const showPrevious = () => {
    setActiveIndex((current) =>
      current === 0
        ? images.length - 1
        : current - 1,
    );
  };

  const showNext = () => {
    setActiveIndex(
      (current) => (current + 1) % images.length,
    );
  };

  const showImage = (index: number) => {
    setActiveIndex(index);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (!hasManyImages) {
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrevious();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={`${food.name} image gallery`}
      tabIndex={hasManyImages ? 0 : -1}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget,
          )
        ) {
          setIsPaused(false);
        }
      }}
      className={[
        "group/carousel relative overflow-hidden bg-[#e8ece5] outline-none",
        "focus-visible:ring-4 focus-visible:ring-[#2f6b45]/25",
        aspectClassName,
      ].join(" ")}
    >
      {images.map((image, index) => {
        const isActive = index === visibleIndex;

        return (
          <img
            key={`${food.id}-${image}`}
            src={image}
            alt={
              isActive
                ? `${food.name} - image ${index + 1}`
                : ""
            }
            aria-hidden={!isActive}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className={[
              "absolute inset-0 h-full w-full object-cover",
              "transition duration-700 ease-out",
              isActive
                ? "visible scale-100 opacity-100"
                : "invisible scale-[1.03] opacity-0",
              isActive
                ? "group-hover/carousel:scale-105"
                : "",
              imageClassName,
            ].join(" ")}
          />
        );
      })}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />

      {hasManyImages && showCounter ? (
        <div
          aria-live="polite"
          className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-md sm:right-4 sm:top-4"
        >
          {visibleIndex + 1} / {images.length}
        </div>
      ) : null}

      {hasManyImages && showControls ? (
        <>
          <button
            type="button"
            onClick={showPrevious}
            aria-label={`Show previous image of ${food.name}`}
            className={[
              "absolute left-3 top-1/2 z-10 flex h-10 w-10",
              "-translate-y-1/2 items-center justify-center rounded-full",
              "border border-white/30 bg-white/90 text-[#1f2a22]",
              "shadow-lg backdrop-blur transition",
              "hover:scale-105 hover:bg-white",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40",
              "sm:left-4 sm:h-11 sm:w-11",
            ].join(" ")}
          >
            <FaChevronLeft aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={showNext}
            aria-label={`Show next image of ${food.name}`}
            className={[
              "absolute right-3 top-1/2 z-10 flex h-10 w-10",
              "-translate-y-1/2 items-center justify-center rounded-full",
              "border border-white/30 bg-white/90 text-[#1f2a22]",
              "shadow-lg backdrop-blur transition",
              "hover:scale-105 hover:bg-white",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40",
              "sm:right-4 sm:h-11 sm:w-11",
            ].join(" ")}
          >
            <FaChevronRight aria-hidden="true" />
          </button>
        </>
      ) : null}

      {hasManyImages ? (
        <div
          className="absolute bottom-3 left-1/2 z-10 flex max-w-[80%] -translate-x-1/2 items-center gap-2 rounded-full bg-black/25 px-3 py-2 backdrop-blur-sm sm:bottom-4"
          role="tablist"
          aria-label={`${food.name} images`}
        >
          {images.map((image, index) => {
            const isActive = index === visibleIndex;

            return (
              <button
                key={`${food.id}-${image}-indicator`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                onClick={() => showImage(index)}
                className={[
                  "h-2 rounded-full transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  isActive
                    ? "w-7 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75",
                ].join(" ")}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
