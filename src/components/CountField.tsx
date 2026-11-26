import { useState } from 'react'
import { TextField } from '@mui/material'

interface Props {
  value: number
  onCommit: (n: number) => void
  label: string
  min?: number
  width?: number
}

/**
 * Integer field that can be emptied and retyped: the text lives locally while
 * editing and is only committed once it is a valid integer ≥ `min`.
 */
export function CountField({ value, onCommit, label, min = 1, width = 170 }: Props) {
  const [text, setText] = useState(String(value))
  const [seen, setSeen] = useState(value)
  // follow changes made elsewhere (loading a file, "clear")
  if (value !== seen) {
    setSeen(value)
    setText(String(value))
  }
  return (
    <TextField
      size="small"
      type="number"
      label={label}
      value={text}
      onChange={(e) => {
        setText(e.target.value)
        const n = Number(e.target.value)
        if (e.target.value.trim() !== '' && Number.isInteger(n) && n >= min) onCommit(n)
      }}
      onBlur={() => setText(String(value))}
      sx={{ width }}
      slotProps={{ htmlInput: { min, inputMode: 'numeric' } }}
    />
  )
}
