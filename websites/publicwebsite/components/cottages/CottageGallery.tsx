"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaImages,
  FaTimes,
} from "react-icons/fa";

import { getImageUrl } from "@/lib/utils/images";

interface CottageGalleryProps {
  images?: string[];
  cottageName?: string;
  title?: string;
  description?: string;
  className?: string;
}

function uniqueImages(images: string[]): string[] {
  return Array.from(
    new Set(
      images
        .map((image) => image.trim())
        .filter(Boolean),
    ),
  );
}

export default function CottageGallery({
  images = [],
  cottageName = "Cottage",
  title = "Cottage gallery",
  description = "Gallery images uploaded for this cottage.",
  className = "",
}: CottageGalleryProps) {
  const galleryImages = useMemo(
    () => uniqueImages(images),
    [images],
  );

  const [activeIndex, setActiveIndex] = useState<number | null>(
    null,
  );

  const visibleImages = galleryImages.slice(0, 5);
  const remainingImages = Math.max(
    galleryImages.length - visibleImages.length,
    0,
  );

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [activeIndex]);

  if (galleryImages.length === 0) {
    return null;
  }

  const activeImage =
    activeIndex === null ? null : galleryImages[activeIndex];

  function openImage(index: number) {
    setActiveIndex(index);
  }

  function closeImage() {
    setActiveIndex(null);
  }

  function showPrevious() {
    setActiveIndex((current) =>
      current === null
        ? null
        : (current - 1 + galleryImages.length) %
          galleryImages.length,
    );
  }

  function showNext() {
    setActiveIndex((current) =>
      current === null
        ? null
        : (current + 1) % galleryImages.length,
    );
  }

  return (
    <section className={className}>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {title}
          </h2>

          {description ? (
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {description}
            </p>
          ) : null}
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--primary-light)] px-4 py-2 text-sm font-semibold text-[var(--primary)]">
          <FaImages aria-hidden="true" />
          {galleryImages.length}{" "}
          {galleryImages.length === 1 ? "image" : "images"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {visibleImages.map((image, index) => {
          const isLeadImage = index === 0;
          const isLastVisible =
            index === visibleImages.length - 1 &&
            remainingImages > 0;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => openImage(index)}
              className={[
                "group relative overflow-hidden rounded-lg",
                "bg-[var(--surface-muted)]",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
                isLeadImage
                  ? "col-span-2 row-span-2"
                  : "",
              ].join(" ")}
              aria-label={`View ${cottageName} gallery image ${
                index + 1
              }`}
            >
              <img
                src={getImageUrl(image)}
                alt={`${cottageName} gallery image ${index + 1}`}
                className={[
                  "w-full object-cover transition duration-300",
                  "group-hover:scale-[1.03]",
                  isLeadImage
                    ? "aspect-[4/3] h-full"
                    : "aspect-[4/3]",
                ].join(" ")}
                loading="eager"
              />

              <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

              {isLastVisible ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-bold text-white">
                  +{remainingImages} more
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${cottageName} image viewer`}
          onClick={closeImage}
        >
          <button
            type="button"
            onClick={closeImage}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-lg transition hover:bg-[var(--surface-muted)]"
            aria-label="Close gallery"
          >
            <FaTimes aria-hidden="true" />
          </button>

          {galleryImages.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-lg transition hover:bg-[var(--surface-muted)]"
              aria-label="Previous image"
            >
              <FaChevronLeft aria-hidden="true" />
            </button>
          ) : null}

          <div
            className="max-h-[86vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={getImageUrl(activeImage)}
              alt={`${cottageName} gallery image ${
                (activeIndex || 0) + 1
              }`}
              className="mx-auto max-h-[82vh] w-full rounded-lg object-contain"
            />

            <p className="mt-3 text-center text-sm font-semibold text-white">
              {(activeIndex || 0) + 1} / {galleryImages.length}
            </p>
          </div>

          {galleryImages.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[var(--foreground)] shadow-lg transition hover:bg-[var(--surface-muted)]"
              aria-label="Next image"
            >
              <FaChevronRight aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
