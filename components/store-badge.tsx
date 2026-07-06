import Image from "next/image";

export default function StoreBadge({
  src,
  alt,
  url,
}: {
  src: string;
  alt: string;
  url: string | null;
}) {
  const img = (
    <Image
      src={src}
      alt={alt}
      width={160}
      height={48}
      className="h-12 w-auto object-contain"
    />
  );

  if (!url) {
    return (
      <div className="cursor-not-allowed opacity-40 select-none" title="Link in arrivo">
        {img}
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="cursor-pointer transition-opacity duration-200 hover:opacity-75"
    >
      {img}
    </a>
  );
}
