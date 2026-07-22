import LoadingSpinner from "@/components/common/LoadingSpinner";
import Container from "@/components/layout/Container";

export default function CottageDetailsLoading() {
  return (
    <Container className="py-16">
      <LoadingSpinner
        size="lg"
        label="Loading cottage details..."
        fullScreen
      />
    </Container>
  );
}