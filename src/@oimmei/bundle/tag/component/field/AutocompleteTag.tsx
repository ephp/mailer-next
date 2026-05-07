import React, {useState, useEffect, useCallback} from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  TextField,
  Chip,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import {DetailResult} from '@Oimmei-Digital-Boutique/crema-components';
import {useAsyncCallHelper2Actions} from '@/@oimmei/services/context/AsyncCallHelper2Provider';
import {useTranslations} from 'next-intl';
import SkeletonWrapper from '@/@oimmei/components/SkeletonWrapper';
import {Add, FiberManualRecord} from "@mui/icons-material";
import {Tag} from "@/@oimmei/bundle/tag/type/model/Tag";

// Tipo base che estende AutocompleteProps mantenendo i generics
// Ma con onChange customizzato che restituisce solo Tag (non string)
interface AutocompleteTagBaseProps<Multiple extends boolean | undefined> extends Omit<
  AutocompleteProps<Tag, Multiple, boolean, true>,
  | 'freeSolo'
  | 'options'
  | 'getOptionLabel'
  | 'inputValue'
  | 'onInputChange'
  | 'renderTags'
  | 'renderInput'
  | 'renderOption'
  | 'noOptionsText'
  | 'filterOptions'
  | 'onChange'
> {
  /**
   * Callback chiamata quando la selezione cambia
   * Nota: riceve solo Tag, non stringhe
   * (le stringhe vengono gestite internamente per creare nuovi tag)
   */
  onChange?: Multiple extends true
    ? (event: React.SyntheticEvent, value: Tag[], reason: any, details?: any) => void
    : (event: React.SyntheticEvent, value: Tag | null, reason: any, details?: any) => void;
  /**
   * Funzione per recuperare tutti i tag disponibili
   */
  fetchAllTags: () => Promise<DetailResult<Tag[]>>;

  /**
   * Funzione per creare un nuovo tag
   */
  createTag?: (params: { label: string }) => Promise<DetailResult<Tag>>;

  /**
   * Label del campo
   */
  label: string;

  /**
   * Placeholder opzionale
   */
  placeholder?: string;

  /**
   * Se true, mostra lo skeleton di caricamento
   */
  loading?: boolean;

  /**
   * Se true, il campo è disabilitato
   */
  disabled?: boolean;

  /**
   * Messaggio di errore da mostrare
   */
  error?: string;

  /**
   * Se true, avvolge il componente con SkeletonWrapper
   */
  wrapping?: boolean;

  /**
   * Nome del campo per l'accessibilità
   */
  name?: string;
}

// Esporta il tipo usando gli stessi generics di AutocompleteProps
export type AutocompleteTagProps<Multiple extends boolean | undefined = undefined> =
  AutocompleteTagBaseProps<Multiple>;

export default function AutocompleteTag<Multiple extends boolean | undefined = undefined>(
  props: AutocompleteTagProps<Multiple>
) {
  const {
    multiple,
    value,
    fetchAllTags,
    createTag,
    onChange,
    label,
    placeholder,
    loading = false,
    disabled = false,
    error,
    wrapping = false,
    name = 'tags',
    ...autocompleteProps
  } = props;

  const t = useTranslations();
  const {performAsyncCall} = useAsyncCallHelper2Actions();

  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Normalizza value come array per semplificare la logica interna
  const selectedTags = React.useMemo(() => {
    return Array.isArray(value) ? value : (value ? [value as Tag] : []);
  }, [value]); // Dipende solo dal prop 'value'

  // Carica i tag disponibili al mount del componente
  const loadAvailableTags = useCallback(async () => {
    setIsLoadingTags(true);
    try {
      const result = await performAsyncCall(fetchAllTags());
      if (result?.item) {
        setAvailableTags(result.item);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei tag:', error);
    } finally {
      setIsLoadingTags(false);
    }
  }, [fetchAllTags, performAsyncCall]);

  useEffect(() => {
    let isMounted = true;

    const loadTags = async () => {
      if (isLoadingTags || availableTags.length > 0) return;

      await loadAvailableTags();
    };

    if (isMounted) {
      loadTags();
    }

    return () => {
      isMounted = false;
    };
  }, [availableTags.length, isLoadingTags, loadAvailableTags]);

  // Gestisce la creazione di un nuovo tag
  const handleCreateTag = useCallback(async (tagLabel: string): Promise<Tag | null> => {
    if (!tagLabel.trim() || isCreatingTag || !createTag) return null;

    setIsCreatingTag(true);
    try {
      const result = await performAsyncCall(createTag({label: tagLabel.trim()}));
      if (result?.item) {
        const newTag = result.item;

        // Aggiunge il nuovo tag alla lista dei tag disponibili
        setAvailableTags(prev => [...prev, newTag]);

        // Aggiunge il nuovo tag alla selezione corrente
        if (multiple) {
          const updatedSelectedTags = [...selectedTags, newTag];
          onChange?.(null as any, updatedSelectedTags as any, 'createOption', undefined);
        } else {
          onChange?.(null as any, newTag as any, 'selectOption', undefined);
        }

        return newTag;
      }
    } catch (error) {
      console.error('Errore nella creazione del tag:', error);
    } finally {
      setIsCreatingTag(false);
    }

    return null;
  }, [createTag, performAsyncCall, selectedTags, onChange, isCreatingTag, multiple]);

  // Filtra i tag disponibili escludendo quelli già selezionati
  const filteredAvailableTags = availableTags.filter(
    tag => !selectedTags.some(selected => selected.id === tag.id)
  );

  // Gestisce il cambio di selezione
  const handleTagsChange = useCallback((
    event: React.SyntheticEvent,
    newValue: Multiple extends true ? (Tag | string)[] : Tag | string | null,
    reason: any,
    details?: any
  ) => {
    if (Array.isArray(newValue)) {
      // Modalità multiple
      const processedTags: Tag[] = [];

      for (const item of newValue) {
        if (typeof item === 'string') {
          // Se è una stringa, significa che l'utente vuole creare un nuovo tag
          handleCreateTag(item);
          return; // La creazione del tag gestirà l'aggiornamento
        } else {
          processedTags.push(item);
        }
      }

      onChange?.(event, processedTags as any, reason, details);
    } else {
      // Modalità single
      if (typeof newValue === 'string') {
        // Se è una stringa, significa che l'utente vuole creare un nuovo tag
        handleCreateTag(newValue);
        return;
      }
      onChange?.(event, newValue as any, reason, details);
    }
  }, [onChange, handleCreateTag]);

  const autocompleteComponent = (
    <Autocomplete
      multiple={multiple}
      freeSolo
      options={filteredAvailableTags}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return option.label;
      }}
      value={value}
      onChange={handleTagsChange as any}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      disabled={disabled || loading}
      loading={isLoadingTags || isCreatingTag}
      renderTags={multiple ? (value, getTagProps) =>
        value.map((option, index) => {
          const textColor = getContrastColor(option.color || '#f5f5f5');
          const {key, ...chipProps} = getTagProps({index});
          return (
            <Chip
              key={key}
              variant="outlined"
              label={option.label}
              style={{
                backgroundColor: option.color || '#f5f5f5',
                color: textColor,
              }}
              {...chipProps}
              sx={{
                '& .MuiChip-deleteIcon': {
                  color: textColor,
                  '&:hover': {
                    color: textColor,
                    opacity: 0.7,
                  },
                },
              }}
            />
          );
        }) : undefined
      }
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          placeholder={selectedTags.length === 0 ? placeholder : undefined}
          error={!!error}
          helperText={error}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {(isLoadingTags || isCreatingTag) ? (
                  <CircularProgress color="inherit" size={20}/>
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          slotProps={{
            inputLabel: {
              shrink: selectedTags.length > 0 || !!inputValue,
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        const {key, ...boxProps} = props;

        // Se è una stringa, significa che è un'opzione per creare un nuovo tag
        if (typeof option === 'string' && createTag) {
          return (
            <Box component="li" key={key} {...boxProps}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#f5f5f5',
                  marginRight: 1,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <FiberManualRecord
                  sx={{
                    fontSize: 8,
                    color: '#ccc',
                  }}
                />
                <Add
                  sx={{
                    fontSize: 8,
                    color: '#666',
                    position: 'absolute',
                  }}
                />
              </Box>
              <Typography variant="body2" noWrap>
                {t('tag.message.create_option', {value: option})}
              </Typography>
            </Box>
          );
        }

        // Tag esistente
        return (
          <Box component="li" key={key} {...boxProps}>
            <FiberManualRecord
              sx={{
                fontSize: 12,
                color: option.color || '#f5f5f5',
                marginRight: 1,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" noWrap>
              {option.label}
            </Typography>
          </Box>
        );
      }}
      noOptionsText={
        inputValue.trim() ?
          `${t('tag.message.create_option', {value: inputValue})}` :
          t('tag.message.no_options')
      }
      filterOptions={(options, params) => {
        const filtered = options.filter(option =>
          option.label.toLowerCase().includes(params.inputValue.toLowerCase())
        );

        const {inputValue} = params;
        const isExisting = options.some(option =>
          option.label.toLowerCase() === inputValue.toLowerCase()
        );

        if (inputValue.trim() !== '' && !isExisting) {
          filtered.push(inputValue.trim() as any);
        }

        return filtered;
      }}
      {...autocompleteProps}
    />
  );

  if (wrapping) {
    return (
      <SkeletonWrapper loading={loading} wrapping={wrapping} width="100%">
        {autocompleteComponent}
      </SkeletonWrapper>
    );
  }

  return autocompleteComponent;
}

// Funzione helper per calcolare il colore del testo in base al colore di sfondo
function getContrastColor(hexColor: string): string {
  // Rimuove il # se presente
  const color = hexColor.replace('#', '');

  // Converte in RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);

  // Calcola la luminanza
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#ffffff';
}