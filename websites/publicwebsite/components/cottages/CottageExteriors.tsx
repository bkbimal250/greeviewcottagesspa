import CottageGallery from "@/components/cottages/CottageGallery";

interface CottageExteriorsProps {
  images?: string[];
  cottageName?: string;
  className?: string;
}

export default function CottageExteriors({
  images = [],
  cottageName = "Cottage",
  className = "",
}: CottageExteriorsProps) {
  return (
    <CottageGallery
      images={images}
      cottageName={cottageName}
      title="Exteriors"
      description="Exterior cottage photos uploaded for this cottage."
      className={className}
    />
  );
}
