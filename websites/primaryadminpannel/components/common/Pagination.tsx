"use client";

import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  siblingCount?: number;
  showFirstLast?: boolean;
  className?: string;
}

function createPageItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): Array<number | "ellipsis-left" | "ellipsis-right"> {
  const totalVisiblePages = siblingCount * 2 + 5;

  if (totalPages <= totalVisiblePages) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  const leftSibling = Math.max(
    currentPage - siblingCount,
    1,
  );

  const rightSibling = Math.min(
    currentPage + siblingCount,
    totalPages,
  );

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis =
    rightSibling < totalPages - 1;

  const pages: Array<
    number | "ellipsis-left" | "ellipsis-right"
  > = [1];

  if (showLeftEllipsis) {
    pages.push("ellipsis-left");
  } else {
    for (let page = 2; page < leftSibling; page += 1) {
      pages.push(page);
    }
  }

  for (
    let page = leftSibling;
    page <= rightSibling;
    page += 1
  ) {
    if (page !== 1 && page !== totalPages) {
      pages.push(page);
    }
  }

  if (showRightEllipsis) {
    pages.push("ellipsis-right");
  } else {
    for (
      let page = rightSibling + 1;
      page < totalPages;
      page += 1
    ) {
      pages.push(page);
    }
  }

  pages.push(totalPages);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  siblingCount = 1,
  showFirstLast = true,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const safeCurrentPage = Math.min(
    Math.max(currentPage, 1),
    totalPages,
  );

  const pageItems = createPageItems(
    safeCurrentPage,
    totalPages,
    siblingCount,
  );

  const startItem =
    totalItems !== undefined && pageSize
      ? (safeCurrentPage - 1) * pageSize + 1
      : undefined;

  const endItem =
    totalItems !== undefined &&
    pageSize &&
    startItem !== undefined
      ? Math.min(
          startItem + pageSize - 1,
          totalItems,
        )
      : undefined;

  function goToPage(page: number) {
    const nextPage = Math.min(
      Math.max(page, 1),
      totalPages,
    );

    if (nextPage !== safeCurrentPage) {
      onPageChange(nextPage);
    }
  }

  const buttonBaseClasses = [
    "inline-flex h-10 min-w-10 items-center justify-center",
    "rounded-lg border px-3",
    "text-sm font-semibold transition",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--primary)]",
    "focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed",
    "disabled:opacity-50",
  ].join(" ");

  return (
    <nav
      aria-label="Pagination"
      className={[
        "flex flex-col gap-4",
        "sm:flex-row sm:items-center sm:justify-between",
        className,
      ].join(" ")}
    >
      <div className="text-sm text-[var(--muted)]">
        {startItem !== undefined &&
        endItem !== undefined &&
        totalItems !== undefined ? (
          <p>
            Showing{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {startItem}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {endItem}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {totalItems}
            </span>{" "}
            results
          </p>
        ) : (
          <p>
            Page{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {safeCurrentPage}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {totalPages}
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showFirstLast ? (
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={safeCurrentPage === 1}
            aria-label="Go to first page"
            className={[
              buttonBaseClasses,
              "border-[var(--border-dark)]",
              "bg-white text-gray-700",
              "hover:bg-[var(--surface-muted)]",
            ].join(" ")}
          >
            <FaAngleDoubleLeft aria-hidden="true" />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() =>
            goToPage(safeCurrentPage - 1)
          }
          disabled={safeCurrentPage === 1}
          aria-label="Go to previous page"
          className={[
            buttonBaseClasses,
            "border-[var(--border-dark)]",
            "bg-white text-gray-700",
            "hover:bg-[var(--surface-muted)]",
          ].join(" ")}
        >
          <FaChevronLeft aria-hidden="true" />
        </button>

        {pageItems.map((item) => {
          if (typeof item !== "number") {
            return (
              <span
                key={item}
                aria-hidden="true"
                className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm text-[var(--muted)]"
              >
                …
              </span>
            );
          }

          const isActive =
            item === safeCurrentPage;

          return (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              aria-current={
                isActive ? "page" : undefined
              }
              aria-label={`Go to page ${item}`}
              className={[
                buttonBaseClasses,
                isActive
                  ? [
                      "border-[var(--primary)]",
                      "bg-[var(--primary)] text-white",
                    ].join(" ")
                  : [
                      "border-[var(--border-dark)]",
                      "bg-white text-gray-700",
                      "hover:bg-[var(--surface-muted)]",
                    ].join(" "),
              ].join(" ")}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() =>
            goToPage(safeCurrentPage + 1)
          }
          disabled={
            safeCurrentPage === totalPages
          }
          aria-label="Go to next page"
          className={[
            buttonBaseClasses,
            "border-[var(--border-dark)]",
            "bg-white text-gray-700",
            "hover:bg-[var(--surface-muted)]",
          ].join(" ")}
        >
          <FaChevronRight aria-hidden="true" />
        </button>

        {showFirstLast ? (
          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            disabled={
              safeCurrentPage === totalPages
            }
            aria-label="Go to last page"
            className={[
              buttonBaseClasses,
              "border-[var(--border-dark)]",
              "bg-white text-gray-700",
              "hover:bg-[var(--surface-muted)]",
            ].join(" ")}
          >
            <FaAngleDoubleRight aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </nav>
  );
}