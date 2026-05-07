'use client';

import React, {ReactElement, useCallback, useEffect, useState} from 'react';
import {useTranslations} from 'next-intl';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AppSearchBar2 from '@/@oimmei/core/AppSearchBar2';
import {
  DetailResult,
  PaginatedQuery,
  PaginatedResult
} from '@Oimmei-Digital-Boutique/crema-components';
import {generatePathStorage} from '@Oimmei-Digital-Boutique/crema-components';
import {useRouter} from 'next/navigation';
import {Tag, TagFilter} from "@/@oimmei/bundle/tag/type/model/Tag";

interface TagListComponentProps<T extends Tag = Tag, F extends TagFilter = TagFilter> {
  getTagsAction: (query: PaginatedQuery<T, F>) => Promise<PaginatedResult<T>>;
  editRoute?: string;
  deleteTagAction?: (params: { entity: T }) => Promise<DetailResult<T>>;
}

export default function TagListComponent<T extends Tag = Tag, F extends TagFilter = TagFilter>(
  {
    getTagsAction,
    editRoute,
    deleteTagAction,
  }: TagListComponentProps<T, F>): ReactElement {
  const t = useTranslations('tag');
  const router = useRouter();

  const [tags, setTags] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTag, setSelectedTag] = useState<T | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTagsAction({
        page: 1,
        perPage: 1000,
        sortBy: 'label' as keyof T,
        sortDirection: 'asc',
        filters: {
          label: searchValue || null,
        } as F,
      });
      setTags(result.items || []);
    } catch (error) {
      console.error(t('message.error.fetching_tags'), error);
    } finally {
      setLoading(false);
    }
  }, [t, getTagsAction, searchValue]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleTagClick = (event: React.MouseEvent<HTMLElement>, tag: T) => {
    setAnchorEl(event.currentTarget);
    setSelectedTag(tag);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTag(null);
  };

  const handleEdit = () => {
    if (selectedTag && editRoute) {
      const path = generatePathStorage(editRoute, {
        id: selectedTag.id.toString(),
      });
      router.push(path);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedTag && deleteTagAction) {
      try {
        await deleteTagAction({entity: selectedTag});
        await fetchTags();
      } catch (error) {
        console.error(t('message.error.delete_tag'), error);
      }
    }
    handleMenuClose();
  };

  const groupedTags = tags.reduce((acc, tag) => {
    const firstLetter = tag.label.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(tag);
    return acc;
  }, {} as Record<string, T[]>);

  const sortedGroups = Object.keys(groupedTags).sort();

  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        gap={1}
        marginBottom={2}
      >
        <AppSearchBar2
          value={searchValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchValue(e.target.value);
          }}
          placeholder={t('placeholder.search')}
        />
      </Stack>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : sortedGroups.length === 0 ? (
        <Typography>{t('message.alert.no_results')}</Typography>
      ) : (
        sortedGroups.map((letter) => (
          <Box key={letter}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: 'text.secondary',
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: 'text.secondary',
              }}
            >
              {letter}
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              sx={{mb: 2}}
            >
              {groupedTags[letter].map((tag) => (
                <Button
                  key={tag.id}
                  variant="contained"
                  onClick={(e) => handleTagClick(e, tag)}
                  sx={{
                    backgroundColor: tag.color,
                    '&:hover': {
                      backgroundColor: tag.color,
                      filter: 'brightness(0.9)',
                    },
                    textTransform: 'none',
                    px: 2,
                  }}
                  endIcon={<ChevronRightIcon/>}
                >
                  {tag.label}
                </Button>
              ))}
            </Stack>
          </Box>
        ))
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {editRoute && (
          <MenuItem onClick={handleEdit}>
            {t('btn.edit')} {selectedTag?.label}
          </MenuItem>
        )}
        {deleteTagAction && (
          <MenuItem onClick={handleDelete}>
            {t('btn.delete')} {selectedTag?.label}
          </MenuItem>
        )}
      </Menu>
    </Stack>
  );
}