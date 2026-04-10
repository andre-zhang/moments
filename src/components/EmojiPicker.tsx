import { useState } from 'react'
import { PIN_EMOJI_OPTIONS } from '../data/pinEmojis'

export function EmojiPicker({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (emoji: string | undefined) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="emoji-picker">
      <div className="emoji-picker-row">
        <span className="emoji-picker-preview">
          {value?.trim() ? (
            <span className="emoji-picker-preview-char">{value}</span>
          ) : (
            <span className="emoji-picker-default">
              <span className="emoji-picker-default-glyph" aria-hidden>
                📍
              </span>
              <span className="emoji-picker-default-text">Default map pin</span>
            </span>
          )}
        </span>
        <button
          type="button"
          className="btn-secondary btn-small"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Choose pin emoji'}
        </button>
        {value ? (
          <button
            type="button"
            className="link-quiet"
            onClick={() => onChange(undefined)}
          >
            Use default
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="emoji-picker-grid">
          {PIN_EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              className={`emoji-picker-cell${value === e ? ' emoji-picker-cell--on' : ''}`}
              onClick={() => {
                onChange(e)
                setOpen(false)
              }}
            >
              {e}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
