"use client";

import {
  useMemo,
  useState,
} from "react";
import reportService from "@/services/report.service";
import type {
  ExportReportPayload,
  ExportReportResult,
  ReportExportFormat,
  ReportFilters,
  ReportType,
} from "@/types/report";

interface ExportButtonProps {
  reportType: ReportType;
  filters?: ReportFilters;
  fileName?: string;
  disabled?: boolean;
  includeSummary?: boolean;
  includeCharts?: boolean;
  onExportStart?: (
    format: ReportExportFormat,
  ) => void;
  onExportComplete?: (
    result: ExportReportResult,
  ) => void;
  onExportError?: (error: unknown) => void;
}

const EXPORT_OPTIONS: Array<{
  label: string;
  value: ReportExportFormat;
  description: string;
}> = [
  {
    label: "Export as CSV",
    value: "csv",
    description:
      "Best for lightweight data exports.",
  },
  {
    label: "Export as Excel",
    value: "xlsx",
    description:
      "Best for calculations and detailed analysis.",
  },
  {
    label: "Export as PDF",
    value: "pdf",
    description:
      "Best for sharing and printing.",
  },
];

function createDownloadFileName(
  reportType: ReportType,
  format: ReportExportFormat,
  customFileName?: string,
): string {
  const baseName =
    customFileName?.trim() ||
    `${reportType}-report-${new Date()
      .toISOString()
      .slice(0, 10)}`;

  const extensionPattern =
    /\.(csv|xlsx|pdf)$/i;

  return extensionPattern.test(baseName)
    ? baseName
    : `${baseName}.${format}`;
}

function downloadFile(
  fileUrl: string,
  fileName: string,
): void {
  const anchor =
    document.createElement("a");

  anchor.href = fileUrl;
  anchor.download = fileName;
  anchor.rel = "noopener noreferrer";

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export default function ExportButton({
  reportType,
  filters = {},
  fileName,
  disabled = false,
  includeSummary = true,
  includeCharts = false,
  onExportStart,
  onExportComplete,
  onExportError,
}: ExportButtonProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [exportingFormat, setExportingFormat] =
    useState<ReportExportFormat | null>(
      null,
    );

  const isExporting =
    exportingFormat !== null;

  const buttonLabel = useMemo(() => {
    if (!exportingFormat) {
      return "Export Report";
    }

    return `Exporting ${exportingFormat.toUpperCase()}...`;
  }, [exportingFormat]);

  const handleExport = async (
    format: ReportExportFormat,
  ) => {
    if (disabled || isExporting) {
      return;
    }

    setExportingFormat(format);
    setIsOpen(false);

    onExportStart?.(format);

    const generatedFileName =
      createDownloadFileName(
        reportType,
        format,
        fileName,
      );

    const payload: ExportReportPayload = {
      ...filters,
      reportType,
      format,
      fileName: generatedFileName,
      includeSummary,
      includeCharts,
    };

    try {
      const result =
        await reportService.exportReport(
          payload,
        );

      if (result.fileUrl) {
        downloadFile(
          result.fileUrl,
          result.fileName ||
            generatedFileName,
        );
      }

      onExportComplete?.(result);
    } catch (error) {
      onExportError?.(error);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() =>
          setIsOpen((current) => !current)
        }
        disabled={disabled || isExporting}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isExporting ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M12 3v12m0 0 4-4m-4 4-4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {buttonLabel}

        {!isExporting && (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {isOpen && !isExporting && (
        <>
          <button
            type="button"
            aria-label="Close export menu"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />

          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
          >
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="text-sm font-semibold text-slate-900">
                Export Report
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Choose your preferred file format.
              </p>
            </div>

            <div className="mt-2 space-y-1">
              {EXPORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="menuitem"
                  onClick={() =>
                    void handleExport(
                      option.value,
                    )
                  }
                  className="w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {option.label}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {option.description}
                      </p>
                    </div>

                    <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-600">
                      {option.value}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}