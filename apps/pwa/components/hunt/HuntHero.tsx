interface HuntHeroProps {
  title: string;
  imageUrl?: string;
}

export default function HuntHero({ title, imageUrl }: HuntHeroProps) {
  return (
    <div className="relative h-64 w-full overflow-hidden bg-neutral-900">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <h1 className="absolute bottom-4 left-4 right-4 text-2xl font-bold text-white">
        {title}
      </h1>
    </div>
  );
}
