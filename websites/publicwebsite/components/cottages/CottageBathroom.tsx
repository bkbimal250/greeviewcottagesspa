import CottageGallery from "@/components/cottages/CottageGallery";

interface CottageBathroomProps {
  images?: string[];
  cottageName?: string;
  className?: string;
}

export default function CottageBathroom({
  images = [],
  cottageName = "Cottage",
  className = "",
}: CottageBathroomProps) {
  return (
    <CottageGallery
      images={images}
      cottageName={cottageName}
      title="Bathroom"
      description="Bathroom photos uploaded for this cottage."
      className={className}
    />
  );
}
