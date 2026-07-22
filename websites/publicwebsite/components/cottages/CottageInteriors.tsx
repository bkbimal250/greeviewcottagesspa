import CottageGallery from "@/components/cottages/CottageGallery";

interface CottageInteriorsProps {
  images?: string[];
  cottageName?: string;
  className?: string;
}

export default function CottageInteriors({
  images = [],
  cottageName = "Cottage",
  className = "",
}: CottageInteriorsProps) {
  return (
    <CottageGallery
      images={images}
      cottageName={cottageName}
      title="Interiors"
      description="Interior room photos uploaded for this cottage."
      className={className}
    />
  );
}
