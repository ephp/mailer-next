'use client';

import React, {ReactElement, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Link from 'next/link';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import {useParams} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {useSnackbar} from 'notistack';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {TaxonomyCategory} from '@/types/models/TaxonomyCategory';
import {
  createTaxonomyCategory,
  deleteTaxonomyCategory,
  getTaxonomyCategoryList,
  updateTaxonomyCategory,
} from '@/shared/helpers/api/taxonomyApiHelper';
import {TAXONOMY_TERMS} from '@/shared/constants/AppRoutes';

const TaxonomyCategoriesContent = (): ReactElement => {
  const t = useTranslations();
  const {enqueueSnackbar} = useSnackbar();
  const {performAsyncCall} = useAsyncCallHelper2Actions();
  const {id: idParam} = useParams<{id: string}>();
  const listId = parseInt(idParam);

  const [categories, setCategories] = useState<TaxonomyCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TaxonomyCategory | null>(null);
  const [nameInput, setNameInput] = useState('');

  const [deletingCategory, setDeletingCategory] = useState<TaxonomyCategory | null>(null);

  useEffect(() => {
    setLoading(true);
    getTaxonomyCategoryList({listId})
      .then((result) => setCategories(result.item ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [listId]);

  const openCreateDialog = (): void => {
    setEditingCategory(null);
    setNameInput('');
    setDialogOpen(true);
  };

  const openEditDialog = (category: TaxonomyCategory): void => {
    setEditingCategory(category);
    setNameInput(category.name);
    setDialogOpen(true);
  };

  const closeDialog = (): void => {
    setDialogOpen(false);
    setNameInput('');
    setEditingCategory(null);
  };

  const handleSave = (): void => {
    if (!nameInput.trim()) return;

    const call = editingCategory
      ? updateTaxonomyCategory({listId, id: editingCategory.id, name: nameInput.trim()})
      : createTaxonomyCategory({listId, name: nameInput.trim()});

    performAsyncCall(call)
      .then((result) => {
        if (result.item) {
          if (editingCategory) {
            setCategories(prev => prev.map(c => c.id === result.item!.id ? result.item! : c));
            enqueueSnackbar({message: t('taxonomy.success.category_updated'), variant: 'success'});
          } else {
            setCategories(prev => [...prev, result.item!]);
            enqueueSnackbar({message: t('taxonomy.success.category_created'), variant: 'success'});
          }
        }
        closeDialog();
      })
      .catch(console.error);
  };

  const handleDelete = (category: TaxonomyCategory): void => {
    performAsyncCall(deleteTaxonomyCategory({listId, id: category.id}))
      .then(() => {
        setCategories(prev => prev.filter(c => c.id !== category.id));
        enqueueSnackbar({message: t('taxonomy.success.category_deleted'), variant: 'success'});
        setDeletingCategory(null);
      })
      .catch(console.error);
  };

  if (loading) {
    return (
      <Stack spacing={1}>
        {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={56}/>)}
      </Stack>
    );
  }

  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 2}}>
        <Button variant="contained" onClick={openCreateDialog}>
          {t('taxonomy.btn.new_category')}
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Typography color="text.secondary" sx={{textAlign: 'center', py: 4}}>
          {t('taxonomy.message.no_categories')}
        </Typography>
      ) : (
        <List>
          {categories.map((category) => (
            <ListItem
              key={category.id}
              divider
              sx={{pr: 14}}
            >
              <ListItemText
                primary={category.name}
                secondary={t('taxonomy.label.term_count', {count: category.termCount})}
              />
              <ListItemSecondaryAction>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Chip
                    label={t('taxonomy.btn.manage_terms')}
                    component={Link}
                    href={generatePathStorage(TAXONOMY_TERMS, {id: idParam, categoryId: category.id.toString()})}
                    icon={<ChevronRightIcon/>}
                    clickable
                    size="small"
                    variant="outlined"
                    sx={{cursor: 'pointer'}}
                  />
                  <IconButton size="small" onClick={() => openEditDialog(category)}>
                    <EditIcon fontSize="small"/>
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeletingCategory(category)}>
                    <DeleteIcon fontSize="small"/>
                  </IconButton>
                </Stack>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          {editingCategory ? t('taxonomy.page.edit_category.title') : t('taxonomy.page.new_category.title')}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('taxonomy.field.name')}
            fullWidth
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>{t('messages.btn.cancel')}</Button>
          <Button onClick={handleSave} variant="contained" disabled={!nameInput.trim()}>
            {t('messages.btn.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deletingCategory !== null} onClose={() => setDeletingCategory(null)}>
        <DialogTitle>{t('taxonomy.message.delete_category.title', {name: deletingCategory?.name ?? ''})}</DialogTitle>
        <DialogContent>
          <Typography>{t('taxonomy.message.delete_category.description')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingCategory(null)}>{t('messages.btn.cancel')}</Button>
          <Button color="error" onClick={() => deletingCategory && handleDelete(deletingCategory)}>
            {t('messages.btn.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaxonomyCategoriesContent;
