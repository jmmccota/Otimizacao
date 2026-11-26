import { TextField } from '@mui/material'

interface Props {
  value: string
  onChange: (v: string) => void
  label: string
  /** translated error message (already localized); also marks the field invalid */
  error?: string
  width?: number
  align?: 'center' | 'left'
}

/** Small numeric text cell. It is a text field so "-", "1," and "1/2" can be typed. */
export function NumField({ value, onChange, label, error, width = 84, align = 'center' }: Props) {
  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      title={error}
      sx={{ width, minWidth: width }}
      slotProps={{
        htmlInput: {
          'aria-label': label,
          'aria-invalid': !!error,
          inputMode: 'decimal',
          autoComplete: 'off',
          style: { textAlign: align, padding: '6px 8px' },
        },
      }}
    />
  )
}
