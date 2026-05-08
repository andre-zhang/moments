import { pickAmbientScenic } from '../lib/ambientScenic'

export function AmbientScenicTile({
  seed,
  className = '',
}: {
  seed: string
  className?: string
}) {
  const scene = pickAmbientScenic(seed)
  return (
    <figure className={`ambient-scenic ${className}`.trim()}>
      <img
        className="ambient-scenic__img"
        src={scene.imageUrl}
        alt={scene.alt}
        loading="lazy"
        decoding="async"
      />
      <figcaption className="ambient-scenic__cap">{scene.location}</figcaption>
    </figure>
  )
}
