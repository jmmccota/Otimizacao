import { createFileRoute } from '@tanstack/react-router'
import { Button, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/')({
  staticData: { theme: 'base', descriptionKey: 'meta.home' },
  component: Home,
})

function Home() {
  const { t } = useTranslation()
  return (
    <Stack spacing={2} sx={{ alignItems: "flex-start" }}>
      <Typography variant="h4">{t('home.title')}</Typography>
      <Typography>{t('home.subtitle')}</Typography>
      <Typography>{t('home.choose')}</Typography>
      <Stack direction="row" spacing={1}>
        <Button variant="contained">Primário</Button>
        <Button variant="contained" color="success">
          Confirmar
        </Button>
        <Button variant="contained" color="error">
          Cancelar
        </Button>
      </Stack>
    </Stack>
  )
}
