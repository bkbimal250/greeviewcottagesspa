import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="text-center">
        <LoadingSpinner
          size="lg"
          label="Loading admin panel..."
        />
      </div>
    </main>
  );
}