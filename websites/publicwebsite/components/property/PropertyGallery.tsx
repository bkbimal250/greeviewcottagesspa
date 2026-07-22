"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaImages,
  FaTimes,
} from "react-icons/fa";
import {
  HiOutlineSparkles,
} from "react-icons/hi2";

import Container from "@/components/layout/Container";
import { getImageUrl } from "@/lib/utils/images";

interface PropertyGalleryImage {
  id?: string;
  image: string;
  alt?: string;
  caption?: string;
}

interface PropertyGalleryProps {
  images?: Array<PropertyGalleryImage | string>;
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

function normalizeImages(
  images: Array<PropertyGalleryImage | string>,
): PropertyGalleryImage[] {
  return images
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `property-gallery-${index}`,
          image: item,
          alt: `Green View Cottages property image ${
            index + 1
          }`,
        };
      }

      return {
        ...item,
        id:
          item.id ||
          `property-gallery-${index}`,
        alt:
          item.alt ||
          `Green View Cottages property image ${
            index + 1
          }`,
      };
    })
    .filter((item) => Boolean(item.image));
}

export default function PropertyGallery({
  images = [],
  title = "Experience the beauty of Green View Cottages",
  subtitle = "Property Gallery",
  description = "Explore our peaceful cottage spaces, natural surroundings and welcoming atmosphere before planning your Mount Abu stay.",
  className = "",
}: PropertyGalleryProps) {
  const normalizedImages = useMemo(
    () => normalizeImages(images),
    [images],
  );

  const [activeIndex, setActiveIndex] =
    useState<number | null>(null);

  const dialogRef =
    useRef<HTMLDivElement | null>(null);

  const activeImage =
    activeIndex !== null
      ? normalizedImages[activeIndex]
      : null;

  const visibleImages =
    normalizedImages.slice(0, 5);

  const remainingCount =
    normalizedImages.length -
    visibleImages.length;

  const closeImage = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) {
        return 0;
      }

      return current === 0
        ? normalizedImages.length - 1
        : current - 1;
    });
  }, [normalizedImages.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) {
        return 0;
      }

      return current ===
        normalizedImages.length - 1
        ? 0
        : current + 1;
    });
  }, [normalizedImages.length]);

  useEffect(() => {
    if (activeIndex === null) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyboard =
      (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          closeImage();
        }

        if (event.key === "ArrowLeft") {
          showPrevious();
        }

        if (event.key === "ArrowRight") {
          showNext();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyboard,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard,
      );
    };
  }, [
    activeIndex,
    closeImage,
    showNext,
    showPrevious,
  ]);

  if (normalizedImages.length === 0) {
    return null;
  }

  return (
    <>
      <section
        className={[
          "relative overflow-hidden",
          "bg-[#f7f5ef] py-16",
          "sm:py-20 lg:py-24",
          className,
        ].join(" ")}
      >
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />

          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#b89654]/10 blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, #173d2c 1px, transparent 0)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        <Container>
          <div className="relative">
            {/* Section heading */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)] shadow-sm">
                  <HiOutlineSparkles
                    aria-hidden="true"
                    className="text-base text-[#b89654]"
                  />

                  {subtitle}
                </div>

                <h2 className="mt-5 max-w-3xl font-[var(--font-playfair)] text-4xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl">
                  {title}
                </h2>

                <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-[var(--primary)] to-[#b89654]" />

                <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                  {description}
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-5 py-3 shadow-[0_10px_30px_rgba(23,61,44,0.08)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                  <FaImages aria-hidden="true" />
                </span>

                <div>
                  <p className="text-lg font-bold leading-none text-[var(--foreground)]">
                    {normalizedImages.length}
                  </p>

                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-[var(--muted)]">
                    {normalizedImages.length === 1
                      ? "Property photo"
                      : "Property photos"}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery grid */}
            <div className="mt-10 grid auto-rows-[210px] gap-4 sm:auto-rows-[250px] md:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[245px]">
              {visibleImages.map(
                (image, index) => {
                  const isPrimary =
                    index === 0;

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() =>
                        setActiveIndex(index)
                      }
                      aria-label={`Open ${image.alt}`}
                      className={[
                        "group relative overflow-hidden",
                        "rounded-[1.5rem]",
                        "border border-white/70",
                        "bg-[var(--surface)] text-left",
                        "shadow-[0_14px_35px_rgba(23,61,44,0.12)]",
                        "transition-all duration-500",
                        "hover:-translate-y-1",
                        "hover:shadow-[0_22px_50px_rgba(23,61,44,0.18)]",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-[var(--primary)]",
                        "focus-visible:ring-offset-3",
                        isPrimary
                          ? "min-h-[360px] md:col-span-2 md:row-span-2 lg:min-h-0"
                          : "",
                      ].join(" ")}
                    >
                      <img
                        src={getImageUrl(
                          image.image,
                        )}
                        alt={image.alt}
                        className={[
                          "absolute inset-0",
                          "h-full w-full object-cover",
                          "transition duration-700",
                          "group-hover:scale-[1.06]",
                        ].join(" ")}
                        loading={
                          isPrimary
                            ? "eager"
                            : "lazy"
                        }
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-80 transition duration-300 group-hover:opacity-100" />

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/10">
                        <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white opacity-0 shadow-lg backdrop-blur-md transition duration-300 group-hover:scale-100 group-hover:opacity-100">
                          <FaExpand
                            aria-hidden="true"
                            className="text-sm"
                          />
                        </span>
                      </div>

                      {image.caption ? (
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <p className="text-sm font-semibold leading-6 text-white drop-shadow-sm">
                            {image.caption}
                          </p>
                        </div>
                      ) : isPrimary ? (
                        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                            <FaImages
                              aria-hidden="true"
                              className="text-xs"
                            />

                            Explore the property
                          </span>
                        </div>
                      ) : null}

                      {index ===
                        visibleImages.length - 1 &&
                      remainingCount > 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#10291e]/72 text-white backdrop-blur-[1px]">
                          <span className="text-3xl font-bold">
                            +{remainingCount}
                          </span>

                          <span className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                            More photos
                          </span>
                        </div>
                      ) : null}
                    </button>
                  );
                },
              )}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
              <FaImages
                aria-hidden="true"
                className="text-[var(--primary)]"
              />

              Select any photo to open the full gallery
            </div>
          </div>
        </Container>
      </section>

      {/* Lightbox */}
      {activeImage &&
      activeIndex !== null ? (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Property image gallery"
          tabIndex={-1}
          onClick={closeImage}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#07120d]/95 p-4 outline-none backdrop-blur-md sm:p-8"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[70vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
          </div>

          {/* Top controls */}
          <div className="absolute left-4 right-4 top-4 z-30 flex items-center justify-between sm:left-6 sm:right-6 sm:top-6">
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md">
              {activeIndex + 1} /{" "}
              {normalizedImages.length}
            </div>

            <button
              type="button"
              onClick={closeImage}
              aria-label="Close gallery"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg text-white backdrop-blur-md transition hover:rotate-90 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          {normalizedImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                aria-label="Previous image"
                className="absolute left-3 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg text-white backdrop-blur-md transition hover:-translate-x-0.5 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6 sm:h-14 sm:w-14"
              >
                <FaChevronLeft aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                aria-label="Next image"
                className="absolute right-3 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg text-white backdrop-blur-md transition hover:translate-x-0.5 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6 sm:h-14 sm:w-14"
              >
                <FaChevronRight aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div
            className="relative z-10 flex max-h-full w-full max-w-6xl flex-col items-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="relative flex max-h-[78vh] w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sm:rounded-3xl">
              <img
                src={getImageUrl(
                  activeImage.image,
                )}
                alt={activeImage.alt}
                className="max-h-[78vh] max-w-full object-contain"
              />
            </div>

            <div className="mt-5 max-w-2xl text-center text-white">
              {activeImage.caption ? (
                <p className="text-sm font-medium leading-6 text-white/90 sm:text-base">
                  {activeImage.caption}
                </p>
              ) : null}

              <p className="mt-2 text-xs text-white/50">
                Use arrow keys to browse or press Escape
                to close
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}