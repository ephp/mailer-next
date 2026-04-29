'use client';

import React, {ReactElement, useRef, useState} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import {generatePathStorage} from "@Oimmei-Digital-Boutique/crema-components";
import {useParams, useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {MAIL_LIST_CONTACTS} from '@/shared/constants/AppRoutes';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {importContacts, ImportResult} from '@/shared/helpers/api/contactApiHelper';

const MAX_ERRORS_SHOWN = 20;

const ImportContent = (): ReactElement => {
  const t = useTranslations();
  const {performAsyncCall} = useAsyncCallHelper2Actions();
  const router = useRouter();
  const {id: idParam} = useParams<{id: string}>();
  const listId = parseInt(idParam);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedFile(e.target.files?.[0] ?? null);
    setImportResult(null);
  };

  const handleImport = (): void => {
    if (!selectedFile) return;
    setLoading(true);
    performAsyncCall(importContacts({listId, file: selectedFile}))
      .then((result) => {
        if (result.item) {
          setImportResult(result.item);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const goToContacts = (): void => {
    router.push(generatePathStorage(MAIL_LIST_CONTACTS, {id: idParam}));
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {t('contact.import.description')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
          {t('contact.import.format_hint')}
        </Typography>
        <Typography variant="caption" component="pre" sx={{
          mt: 1,
          display: 'block',
          background: (theme) => (theme.vars ?? theme).palette.action.hover,
          padding: '8px 12px',
          borderRadius: 1,
          fontFamily: 'monospace',
        }}>
          {t('contact.import.format_example')}
        </Typography>
      </Box>

      <Divider/>

      <Box>
        <input
          type="file"
          accept=".csv,text/csv"
          ref={fileInputRef}
          style={{display: 'none'}}
          onChange={handleFileChange}
        />
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
            {t('contact.import.btn.select_file')}
          </Button>
          {selectedFile && (
            <Typography variant="body2">
              {selectedFile.name}
            </Typography>
          )}
        </Stack>
      </Box>

      <Box>
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={!selectedFile || loading}
        >
          {t('contact.import.btn.import')}
        </Button>
      </Box>

      {importResult !== null && (
        <Stack spacing={2}>
          <Divider/>

          <Alert severity={importResult.imported > 0 ? 'success' : 'info'}>
            {t('contact.import.result.imported', {count: importResult.imported})}
          </Alert>

          {importResult.skipped > 0 && (
            <Alert severity="info">
              {t('contact.import.result.skipped', {count: importResult.skipped})}
            </Alert>
          )}

          {importResult.errors.length > 0 && (
            <Alert severity="warning">
              <Typography variant="body2" sx={{fontWeight: 600, mb: 1}}>
                {t('contact.import.result.errors', {count: importResult.errors.length})}
              </Typography>
              <List dense disablePadding>
                {importResult.errors.slice(0, MAX_ERRORS_SHOWN).map((err, idx) => (
                  <ListItem key={idx} disablePadding sx={{py: 0.25}}>
                    <Typography variant="body2">
                      {t('contact.import.result.error_row', {
                        row: err.row,
                        email: err.email ?? '—',
                        reason: t(`contact.import.error.${err.error}`),
                      })}
                    </Typography>
                  </ListItem>
                ))}
                {importResult.errors.length > MAX_ERRORS_SHOWN && (
                  <ListItem disablePadding sx={{py: 0.25}}>
                    <Typography variant="body2" color="text.secondary">
                      {t('contact.import.result.more_errors', {count: importResult.errors.length - MAX_ERRORS_SHOWN})}
                    </Typography>
                  </ListItem>
                )}
              </List>
            </Alert>
          )}

          <Box>
            <Button variant="contained" onClick={goToContacts}>
              {t('contact.import.btn.back_to_contacts')}
            </Button>
          </Box>
        </Stack>
      )}
    </Stack>
  );
};

export default ImportContent;
