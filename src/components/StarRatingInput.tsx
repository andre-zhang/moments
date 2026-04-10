/** 1–5 stars; click again on same star clears. */
export function StarRatingInput({
  value,
  onChange,
  label,
  id,
}: {
  value: number | ''
  onChange: (n: number | '') => void
  label?: string
  id?: string
}) {
  const v = value === '' ? 0 : value
  return (
    <div className="star-rating-input" id={id}>
      {label ? <span className="star-rating-input__label">{label}</span> : null}
      <div className="star-rating-input__stars" role="group" aria-label={label ?? 'Rating'}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`star-rating-input__btn${n <= v ? ' star-rating-input__btn--on' : ''}`}
            aria-pressed={n <= v}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            onClick={() => onChange(v === n ? '' : n)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}
