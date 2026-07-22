import CottageGallery from "@/components/cottages/CottageGallery";

interface CottageBedroomProps {
  images?: string[];
  cottageName?: string;
  className?: string;
}

export default function CottageBedroom({
  images = [],
  cottageName = "Cottage",
  className = "",
}: CottageBedroomProps) {
  return (
    <CottageGallery
      images={images}
      cottageName={cottageName}
      title="Bedroom"
      description="Bed and sleeping-space photos uploaded for this cottage."
      className={className}
    />
  );
}
