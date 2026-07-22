"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import {
  FaCloudUploadAlt,
  FaImage,
  FaStar,
  FaTrashAlt,
} from "react-icons/fa";

import Button from "@/components/common/Button";

export interface ExistingGalleryImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface NewGalleryImage {
  id: string;
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

interface PropertyGalleryManagerProps {
  existingImages?: ExistingGalleryImage[];
  onExistingImagesChange?: (
    images: ExistingGalleryImage[],
  ) => void;
  onNewImagesChange?: (
    images: NewGalleryImage[],
  ) => void;
  onDeleteExisting?: (
    image: ExistingGalleryImage,
  ) => void | Promise<void>;
  maxImages?: number;
  maxSizeMb?: number;
  accept?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export default function PropertyGalleryManager({
  existingImages = [],
  onExistingImagesChange,
  onNewImagesChange,
  onDeleteExisting,
  maxImages = 12,
  maxSizeMb = 5,
  accept = "image/jpeg,image/png,image/webp",
  disabled = false,
  error,
  className = "",
}: PropertyGalleryManagerProps) {
  const generatedId = useId();
  const inputId = `property-gallery-${generatedId}`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [savedImages, setSavedImages] =
    useState<ExistingGalleryImage[]>(existingImages);

  const [newImages, setNewImages] = useState<
    NewGalleryImage[]
  >([]);

  const [dragActive, setDragActive] =
    useState(false);

  const [internalError, setInternalError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  useEffect(() => {
    setSavedImages(existingImages);
  }, [existingImages]);

  useEffect(() => {
    onNewImagesChange?.(newImages);
  }, [newImages, onNewImagesChange]);

  useEffect(() => {
    return () => {
      newImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [newImages]);

  const totalImages =
    savedImages.length + newImages.length;

  function updateSavedImages(
    images: ExistingGalleryImage[],
  ) {
    setSavedImages(images);
    onExistingImagesChange?.(images);
  }

  function validateFile(file: File): string {
    const acceptedTypes = accept
      .split(",")
      .map((type) => type.trim());

    if (!acceptedTypes.includes(file.type)) {
      return `${file.name} is not a supported image format.`;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      return `${file.name} must be smaller than ${maxSizeMb} MB.`;
    }

    return "";
  }

  function addFiles(files: File[]) {
    if (disabled || files.length === 0) {
      return;
    }

    const remainingSlots = maxImages - totalImages;

    if (remainingSlots <= 0) {
      setInternalError(
        `You can upload a maximum of ${maxImages} images.`,
      );
      return;
    }

    const acceptedFiles = files.slice(0, remainingSlots);
    const nextImages: NewGalleryImage[] = [];

    for (const file of acceptedFiles) {
      const validationError = validateFile(file);

      if (validationError) {
        setInternalError(validationError);
        continue;
      }

      nextImages.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary:
          savedImages.length === 0 &&
          newImages.length === 0 &&
          nextImages.length === 0,
      });
    }

    if (files.length > remainingSlots) {
      setInternalError(
        `Only ${remainingSlots} more image${
          remainingSlots === 1 ? "" : "s"
        } can be added.`,
      );
    } else if (nextImages.length > 0) {
      setInternalError("");
    }

    setNewImages((current) => [
      ...current,
      ...nextImages,
    ]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    addFiles(
      Array.from(event.target.files || []),
    );
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setDragActive(false);

    addFiles(
      Array.from(event.dataTransfer.files || []),
    );
  }

  function setExistingAsPrimary(id: string) {
    const updatedSavedImages = savedImages.map(
      (image) => ({
        ...image,
        isPrimary: image.id === id,
      }),
    );

    setNewImages((current) =>
      current.map((image) => ({
        ...image,
        isPrimary: false,
      })),
    );

    updateSavedImages(updatedSavedImages);
  }

  function setNewAsPrimary(id: string) {
    updateSavedImages(
      savedImages.map((image) => ({
        ...image,
        isPrimary: false,
      })),
    );

    setNewImages((current) =>
      current.map((image) => ({
        ...image,
        isPrimary: image.id === id,
      })),
    );
  }

  async function removeExistingImage(
    image: ExistingGalleryImage,
  ) {
    if (disabled || deletingId) {
      return;
    }

    setDeletingId(image.id);

    try {
      await onDeleteExisting?.(image);

      const remainingImages = savedImages.filter(
        (item) => item.id !== image.id,
      );

      if (
        image.isPrimary &&
        remainingImages.length > 0
      ) {
        remainingImages[0] = {
          ...remainingImages[0],
          isPrimary: true,
        };
      } else if (
        image.isPrimary &&
        remainingImages.length === 0 &&
        newImages.length > 0
      ) {
        setNewImages((current) =>
          current.map((item, index) => ({
            ...item,
            isPrimary: index === 0,
          })),
        );
      }

      updateSavedImages(remainingImages);
    } finally {
      setDeletingId(null);
    }
  }

  function removeNewImage(id: string) {
    const imageToRemove = newImages.find(
      (image) => image.id === id,
    );

    if (imageToRemove) {
      URL.revokeObjectURL(
        imageToRemove.previewUrl,
      );
    }

    const remainingImages = newImages.filter(
      (image) => image.id !== id,
    );

    if (
      imageToRemove?.isPrimary &&
      savedImages.length === 0 &&
      remainingImages.length > 0
    ) {
      remainingImages[0] = {
        ...remainingImages[0],
        isPrimary: true,
      };
    }

    setNewImages(remainingImages);
  }

  const displayedError =
    error || internalError;

  return (
    <section
      className={[
        "rounded-[var(--radius-xl)]",
        "border border-[var(--border)]",
        "bg-white p-5 shadow-sm sm:p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            Property Gallery
          </h2>

          <p className="mt-1 text-sm text-[var(--muted)]">
            Upload property rooms, exterior and facility
            images.
          </p>
        </div>

        <p className="text-sm font-semibold text-[var(--muted)]">
          {totalImages}/{maxImages} images
        </p>
      </div>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled && totalImages < maxImages) {
            inputRef.current?.click();
          }
        }}
        onKeyDown={(event) => {
          if (
            !disabled &&
            totalImages < maxImages &&
            (event.key === "Enter" ||
              event.key === " ")
          ) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();

          if (!disabled) {
            setDragActive(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={[
          "mt-5 flex min-h-44 flex-col items-center justify-center",
          "rounded-xl border-2 border-dashed p-6",
          "text-center transition",
          disabled || totalImages >= maxImages
            ? "cursor-not-allowed bg-gray-100 opacity-60"
            : "cursor-pointer hover:bg-[var(--surface-muted)]",
          dragActive
            ? "border-[var(--primary)] bg-[var(--primary-light)]"
            : displayedError
              ? "border-[var(--danger)]"
              : "border-[var(--border-dark)]",
        ].join(" ")}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-2xl text-[var(--primary)]">
          {dragActive ? (
            <FaCloudUploadAlt aria-hidden="true" />
          ) : (
            <FaImage aria-hidden="true" />
          )}
        </div>

        <p className="mt-4 text-sm font-bold text-[var(--foreground)]">
          {totalImages >= maxImages
            ? "Maximum image limit reached"
            : dragActive
              ? "Drop images here"
              : "Click or drag images to upload"}
        </p>

        <p className="mt-2 text-xs text-[var(--muted)]">
          JPG, PNG or WebP up to {maxSizeMb} MB each
        </p>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={handleInputChange}
      />

      {displayedError ? (
        <p
          role="alert"
          className="form-error"
        >
          {displayedError}
        </p>
      ) : null}

      {totalImages > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {savedImages.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-white"
            >
              <div className="relative aspect-[4/3] bg-[var(--surface-muted)]">
                <img
                  src={image.url}
                  alt={
                    image.alt ||
                    "Property gallery image"
                  }
                  className="h-full w-full object-cover"
                />

                {image.isPrimary ? (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[var(--primary)] shadow">
                    <FaStar aria-hidden="true" />
                    Primary
                  </span>
                ) : null}
              </div>

              <div className="flex gap-2 p-3">
                {!image.isPrimary ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    fullWidth
                    disabled={disabled}
                    leftIcon={
                      <FaStar aria-hidden="true" />
                    }
                    onClick={() =>
                      setExistingAsPrimary(image.id)
                    }
                  >
                    Set Primary
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  fullWidth={image.isPrimary}
                  loading={deletingId === image.id}
                  loadingText="Removing..."
                  disabled={disabled}
                  leftIcon={
                    <FaTrashAlt aria-hidden="true" />
                  }
                  onClick={() =>
                    removeExistingImage(image)
                  }
                >
                  Remove
                </Button>
              </div>
            </article>
          ))}

          {newImages.map((image) => (
            <article
              key={image.id}
              className="overflow-hidden rounded-xl border border-[var(--border)] bg-white"
            >
              <div className="relative aspect-[4/3] bg-[var(--surface-muted)]">
                <img
                  src={image.previewUrl}
                  alt={image.file.name}
                  className="h-full w-full object-cover"
                />

                {image.isPrimary ? (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[var(--primary)] shadow">
                    <FaStar aria-hidden="true" />
                    Primary
                  </span>
                ) : null}

                <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow">
                  New
                </span>
              </div>

              <div className="p-3">
                <p className="mb-3 truncate text-xs text-[var(--muted)]">
                  {image.file.name}
                </p>

                <div className="flex gap-2">
                  {!image.isPrimary ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      fullWidth
                      disabled={disabled}
                      leftIcon={
                        <FaStar aria-hidden="true" />
                      }
                      onClick={() =>
                        setNewAsPrimary(image.id)
                      }
                    >
                      Set Primary
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    fullWidth={image.isPrimary}
                    disabled={disabled}
                    leftIcon={
                      <FaTrashAlt aria-hidden="true" />
                    }
                    onClick={() =>
                      removeNewImage(image.id)
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}