import { useRef, useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import FileOpenIcon from '@mui/icons-material/FileOpen'
import LightbulbIcon from '@mui/icons-material/LightbulbOutlined'
import SaveAltIcon from '@mui/icons-material/SaveAlt'
import { useTranslation } from 'react-i18next'

interface Props {
  /** called with the text of the chosen file */
  onFile: (text: string) => void
  onSave: () => void
  onExample: () => void
  onClear: () => void
  exampleLabel?: string
}

/** Load / save / example / clear — the buttons around the problem editor. */
export function FileTools({ onFile, onSave, onExample, onClear, exampleLabel }: Props) {
  const { t } = useTranslation('solver')
  const input = useRef<HTMLInputElement>(null)
  const [confirm, setConfirm] = useState(false)

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <input
        ref={input}
        type="file"
        accept=".txt,text/plain"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = '' // allow re-selecting the same file
          if (file) onFile(await file.text())
        }}
      />
      <Button variant="outlined" startIcon={<LightbulbIcon />} onClick={onExample}>
        {exampleLabel ?? t('actions.example')}
      </Button>
      <Button variant="outlined" startIcon={<FileOpenIcon />} onClick={() => input.current?.click()}>
        {t('actions.load')}
      </Button>
      <Button variant="outlined" startIcon={<SaveAltIcon />} onClick={onSave}>
        {t('actions.save')}
      </Button>
      <Button variant="outlined" color="error" startIcon={<DeleteSweepIcon />} onClick={() => setConfirm(true)}>
        {t('actions.clear')}
      </Button>
      <Dialog open={confirm} onClose={() => setConfirm(false)}>
        <DialogTitle>{t('actions.confirmClear.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('actions.confirmClear.text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(false)}>{t('actions.confirmClear.cancel')}</Button>
          <Button
            color="error"
            onClick={() => {
              setConfirm(false)
              onClear()
            }}
          >
            {t('actions.confirmClear.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
