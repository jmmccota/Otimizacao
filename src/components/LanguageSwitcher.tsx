import { MenuItem, Select } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { LANGUAGES, type Language } from '../i18n'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? 'pt') as Language
  return (
    <Select
      size="small"
      value={current}
      onChange={(e) => void i18n.changeLanguage(e.target.value)}
      inputProps={{ 'aria-label': t('language.label') }}
      sx={{ color: 'inherit', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,.5)' }, '.MuiSvgIcon-root': { color: 'inherit' } }}
    >
      {LANGUAGES.map((l) => (
        <MenuItem key={l} value={l}>
          {t(`language.${l}`)}
        </MenuItem>
      ))}
    </Select>
  )
}
