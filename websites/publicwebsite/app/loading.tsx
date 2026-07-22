import LoadingSpinner from "@/components/common/LoadingSpinner";
import Container from "@/components/layout/Container";

export default function Loading() {
  return (
    <Container className="py-16">
      <LoadingSpinner
        size="lg"
        label="Loading Green View Cottages..."
        fullScreen
      />
    </Container>
  );
}