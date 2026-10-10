import Image from "next/image";
import BuildingArt from "@/components/BuildingArt";

// Фото проекта, а если его нет — схематичные дома цвета статуса.
export default function ProjectCover({ project, className = "", sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw", priority = false }) {
  const image = project.images?.[0];
  if (!image) return <BuildingArt slug={project.slug} status={project.status} className={className} />;
  return (
    <div className={`relative overflow-hidden bg-canvas ${className}`}>
      <Image
        src={image.url}
        alt={image.caption ?? project.name}
        fill
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className="object-cover"
      />
    </div>
  );
}
