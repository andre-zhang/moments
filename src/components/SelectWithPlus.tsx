import { PlusCreateMenu } from './PlusCreateMenu'

/** Select (or filter) with a trailing + menu for Trip / Moment. */
export function SelectWithPlus({
  children,
  plusAlign = 'right',
}: {
  children: React.ReactNode
  /** Where the dropdown opens (narrow side rails use left). */
  plusAlign?: 'left' | 'right'
}) {
  return (
    <div className="select-with-add">
      {children}
      <PlusCreateMenu align={plusAlign} />
    </div>
  )
}
