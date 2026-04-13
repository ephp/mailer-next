import React, {
  ChangeEventHandler,
  ReactElement, useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import Button, {ButtonProps} from '@mui/material/Button';
import Popper, {PopperProps} from '@mui/material/Popper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Grow from '@mui/material/Grow';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import Paper, {PaperProps} from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import {useTranslations} from 'next-intl';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormHelperText from '@mui/material/FormHelperText';

/**
 * Interface for the group of an option, used for grouping.
 */
export interface Select3Group {
  /**
   * 0 is a special value for a built-in group.
   */
  id: Exclude<string | number, 0 | '0'>;

  label: string;
}

interface Select3GroupDetail<
  Value extends NonNullable<any> = NonNullable<any>
> extends Select3Group {
  options: Value[];
}

/**
 * Basic props, regardless of the multiple flag.
 */
interface Select3PropsBase<
  Value extends NonNullable<any> = NonNullable<any>
> {
  /**
   * The message displayed when no item is selected.
   */
  placeholder?: string;

  /**
   * The selectable options.
   */
  options: Value[];

  /**
   * Gets an option and returns the label for it.
   *
   * If not provided, toString will be used.
   */
  getOptionLabel?: (option: Value) => string;

  /**
   * A function that returns true if
   * {@param option} is equal to {@param value}.
   *
   * If not provided, referential
   * equality will be used (===).
   */
  isOptionEqualToValue?: (
    option: Value,
    value: Value,
  ) => boolean;

  /**
   * Returns TRUE if the given option matches
   * the given query while filtering.
   */
  filterOption?: (
    option: Value,
    query: string,
  ) => boolean;

  /**
   * Returns every group the given option belongs to.
   * If the option doesn't belong to any group,
   * return an empty array so Select3 knows.
   *
   * Groupless options will be put in a separate group.
   *
   * If this is not given, options will not be grouped.
   */
  getOptionGroups?: (option: Value) => Select3Group[];

  /**
   * Customization label for the special
   * group for groupless options.
   */
  noGroupLabel?: string;

  /**
   * Customization message for the
   * selection resume at the top.
   */
  selectionMessage?: string;

  /**
   * Customization message for the clear button.
   */
  clearSelectionMessage?: string;

  /**
   * TRUE if the options are being loaded.
   * Disables the menu and shows a message.
   */
  loading?: boolean;

  /**
   * Callback used when the element is open.
   */
  onEnter?: () => void;

  /**
   * Callback used when the element is closed.
   */
  onExit?: () => void;

  /**
   * TRUE if this input is in an invalid state.
   */
  error?: boolean;

  /**
   * The helper text to display below, if any.
   */
  helperText?: string;

  /**
   * Additional props for the button element.
   */
  ButtonProps?: ButtonProps;

  /**
   * Additional props for the popper element.
   */
  PopperProps?: PopperProps;

  /**
   * Additional props for the paper element.
   */
  PaperProps?: PaperProps;
}

/**
 * Props for single-value use.
 */
interface Select3SingleValueProps<
  Value extends NonNullable<any> = NonNullable<any>
> {
  multiple: false;

  /**
   * The currently selected value.
   */
  value: Value | null;

  /**
   * The change callback.
   */
  onChange: (
    newValue: Value | null,
  ) => void;
}

/**
 * Props for multiple value use.
 */
interface Select3MultipleValueProps<
  Value extends NonNullable<any> = NonNullable<any>
> {
  multiple: true;

  /**
   * The currently selected value.
   */
  value: Value[];

  /**
   * The change callback.
   */
  onChange: (newValue: Value[]) => void;

  /**
   * The message displayed when one or
   * more items are selected, like:
   *
   * <selectedItemsMessage>: 3.
   */
  selectedItemsMessage?: string;

  /**
   * "Select all" button message.
   */
  selectAllMessage?: string;
}

export type Select3Props<
  Value extends NonNullable<any> = NonNullable<any>,
> = Select3PropsBase<Value> & (
  | Select3SingleValueProps<Value>
  | Select3MultipleValueProps<Value>
  )
  ;

/**
 * A complex select component, based on Dipendenti in cloud.
 * Built using MUI components and based on this example.
 *
 * @link https://mui.com/material-ui/react-menu/#menulist-composition
 *
 * Supports grouping and filtering.
 */
function Select3<Value = any>(
  {
    placeholder,
    value,
    onChange,
    options,
    getOptionLabel =
      (option) => String(option),
    isOptionEqualToValue =
      (option, value) => option === value,
    filterOption,
    getOptionGroups,
    noGroupLabel,
    selectionMessage,
    clearSelectionMessage,
    loading,
    onEnter,
    onExit,
    multiple,
    error,
    helperText,
    ButtonProps,
    PopperProps,
    PaperProps,
    ...rest
  }: Select3Props<Value>,
): ReactElement | null {
  const componentId = useId();

  const t = useTranslations('messages');

  const [
    open,
    setOpen,
  ] = useState<boolean>(false);
  const anchorRef =
    useRef<HTMLButtonElement>(null);

  // Input value for the search field.
  const [
    searchInputValue,
    setSearchInputValue,
  ] = useState<string>('');

  // Options resulting from filtering with the text input.
  const [
    filteredOptions,
    setFilteredOptions,
  ] = useState<typeof options | null>(null);

  // The previous open state to properly perform effects.
  const prevOpenRef =
    useRef<boolean>(open);

  const handleClick = (): void => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (
    event: Event | React.SyntheticEvent,
  ): void => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleListKeyDown = (
    event: React.KeyboardEvent,
  ): void => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  // return focus to the button when we transitioned from !open -> open
  useEffect(() => {
    if (prevOpenRef.current && !open) {
      anchorRef.current!.focus();
    }
  }, [open]);

  const handleOptionClick = (option: Value): void => {
    if (!multiple) {
      if (value === null || !isOptionEqualToValue(option, value)) {
        // Single value, replacing it.
        onChange(option);

        // Closing the menu.
        setOpen(false);
      }
    } else {
      // Multiple value, adding it.
      // Using the value to update the value, in case it's a state which
      // is most likely, is technically bad, but I didn't find a better way.
      const existingValueItemIndex = value
        .findIndex(item => isOptionEqualToValue(option, item));

      if (existingValueItemIndex === -1) {
        // Not selected, selecting it.
        onChange([...value, option]);
      } else {
        // Selected, deselecting it.
        onChange(value.filter(
            (item, index) =>
              index !== existingValueItemIndex,
          ),
        );
      }
    }
  };

  /**
   * Multiple options were selected together, possibly from a group.
   */
  const handleOptionsSelect = (optionsSelected: Value[], selected: boolean): void => {
    // Only considering multiple-value, since this makes no sense otherwise.
    if (multiple) {
      if (selected) {
        // All the given options were selected, if they weren't already.
        const newValue = [...value];

        for (let i = 0; i < optionsSelected.length; i++) {
          if (!newValue.some(item => isOptionEqualToValue(optionsSelected[i], item))) {
            newValue.push(optionsSelected[i]);
          }
        }

        onChange(newValue);
      } else {
        // All the given options were deselected.
        onChange(
          value
            .filter(item => !optionsSelected
              .some((option) => isOptionEqualToValue(option, item))));
      }
    }
  };

  const handleClear = (): void => {
    if (!multiple) {
      // Single-value, setting it to NULL.
      onChange(null);
    } else {
      // Multiple-value, setting it to an empty array.
      onChange([]);
    }
  };

  const handleOptionDelete = (option: Value): void => {
    if (!multiple) {
      // Single-value, setting it to NULL.
      onChange(null);
    } else {
      // Multiple-value, removing it from the array.
      onChange(
        value
          .filter(item => !isOptionEqualToValue(option, item)),
      );
    }
  };

  const handleSearchInputValueChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const newValue = event.target.value;

    // Changing the value displayed on the input.
    setSearchInputValue(newValue);

    if (newValue !== '') {
      // Filtering the options.
      if (filterOption !== undefined) {
        setFilteredOptions(
          options.filter(item => filterOption(item, newValue)),
        );
      }
    } else {
      // No filter, clearing filtered options.
      setFilteredOptions(null);
    }
  };

  // This is a callback because an effect needs it.
  const handleSearchInputValueClear = useCallback(
    (): void => {
      setSearchInputValue('');
      setFilteredOptions(null);
    },
    [],
  );

  const isOptionSelected = (option: Value): boolean => {
    if (!multiple) {
      // Single value, just comparing the two.
      return value !== null && isOptionEqualToValue(
        option,
        value as Value,
      );
    } else {
      // Multiple values, looking for it in the array.
      return (value as Value[])
        .some(item => isOptionEqualToValue(option, item));
    }
  };

  // When the popper closes, clearing the search input value.
  useEffect(() => {
    if (!open) {
      handleSearchInputValueClear();
    }
  }, [open, handleSearchInputValueClear]);

  // When the popper opens or closes, calling the event handler, if any.
  // Using a ref so the effect is not re-run when the function changes.
  const onEnterRef = useRef<typeof onEnter>(onEnter);
  const onExitRef = useRef<typeof onExit>(onExit);

  // Updating the callback refs when the prop changes.
  useEffect(() => {
    onEnterRef.current = onEnter;
  }, [onEnter]);
  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  useEffect(() => {
    if (!prevOpenRef.current && open) {
      if (onEnterRef.current !== undefined) {
        onEnterRef.current();
      }
    }
    if (prevOpenRef.current && !open) {
      if (onExitRef.current !== undefined) {
        onExitRef.current();
      }
    }
  }, [open]);

  // Updating the previous open ref value.
  // *This must be the last effect*, because the
  // other ones won't work properly otherwise.
  useEffect(() => {
    prevOpenRef.current = open;
  }, [open]);

  // Building the grouped structure, if needed.
  const groups: Select3GroupDetail<Value>[] | null = getOptionGroups !== undefined ?
    [] : null;
  // The getOptionGroups check is technically not necessary,
  // but TypeScript will give me errors if I don't do it.
  if (groups !== null && getOptionGroups !== undefined) {
    const groupByIdMap =
      new Map<Select3Group['id'], Select3GroupDetail<Value>>();

    // Handling the groupless items group so it's always displayed last.
    const grouplessItemsGroup: Select3GroupDetail<Value> = {
      id: 0,
      label: noGroupLabel ?? t('select3.no_group'),
      options: [],
    };

    for (let i = 0; i < options.length; i++) {
      const optionGroups = getOptionGroups(options[i]);

      if (optionGroups.length !== 0) {
        // The option belongs to at least one group.
        for (let j = 0; j < optionGroups.length; j++) {
          let group = groupByIdMap.get(optionGroups[j].id);
          if (group === undefined) {
            group = {
              id: optionGroups[j].id,
              label: optionGroups[j].label,
              options: [],
            };
          }

          group.options.push(options[i]);

          groupByIdMap.set(optionGroups[j].id, group);
        }
      } else {
        // The option doesn't belong to any group.
        grouplessItemsGroup.options.push(options[i]);
      }
    }

    groups.push(...Array.from(groupByIdMap.values()), grouplessItemsGroup);
  }

  return (
    <>
      <Button
        ref={anchorRef}
        id={`${componentId}-button`}
        aria-controls={open ? `${componentId}-menu` : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup={"true"}
        variant={"contained"}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon/>}
        disabled={loading}
        {...(ButtonProps ?? {})}
        color={error ? 'error' : ButtonProps?.color}
      >
        {!loading ? (
          !multiple ? (
            // Single-value: placeholder or item label.
            (value !== null ? getOptionLabel(value) : (placeholder ?? t('select3.placeholder')))
          ) : (
            // Multiple-value: placeholder, item label or item count.
            (value.length > 0 ? (
                  value.length > 1 ?
                    `${(rest as Select3MultipleValueProps)
                      .selectedItemsMessage ?? t(
                      'select3.selected_items')}: ${value.length}` : getOptionLabel(value[0])) :
                (placeholder ?? t(
                  'select3.placeholder'))
            )
          )
        ) : (
          t('select3.loading')
        )}
      </Button>
      {helperText !== undefined && (
        <FormHelperText
          sx={{
            marginX: "14px",
            color: error ? (theme) => (theme.vars ?? theme).palette.error.main : undefined,
          }}
        >
          {helperText}
        </FormHelperText>
      )}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        {...PopperProps}
        sx={{
          // Necessary to go over drawers.
          zIndex: 1400,
          ...(PopperProps?.sx ?? {}),
        }}
      >
        {({
            TransitionProps,
            placement,
          }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom-start' ?
                  'left bottom' : 'left top',
            }}
          >
            <Paper
              {...(PaperProps ?? {})}
              style={{
                width: '400px',
                maxHeight: 'min(600px, 80vh)',
                overflowY: 'auto',
                overflowX: 'hidden',
                ...(PaperProps?.style ?? {}),
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <Box>
                  <Box padding={2}>
                    {/* Line with report and clear button. */}
                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                      marginBottom={2}
                    >
                      <Typography>
                        {selectionMessage ?? t('select3.selection')}
                      </Typography>

                      <Link
                        component={'button'}
                        color={'error'}
                        onClick={handleClear}
                      >
                        {clearSelectionMessage ?? t('select3.clear_selection')}
                      </Link>
                    </Stack>

                    {/* List of selected options. */}
                    {((!multiple && value !== null) || (multiple && value?.length > 0)) ? (
                      <Stack
                        direction={'row'}
                        flexWrap={'wrap'}
                        gap={'4px'}
                      >
                        {!multiple ? (
                          getOptionLabel(value!)
                        ) : (
                          value.map((item, index) => (
                            <Chip
                              key={index}
                              label={getOptionLabel(item)}
                              onDelete={() => handleOptionDelete(item)}
                              size={'small'}
                            />
                          ))
                        )}
                      </Stack>
                    ) : (
                      // Empty state.
                      (<Typography>
                        {t('select3.none_selected')}
                      </Typography>)
                    )}
                  </Box>

                  <Divider/>

                  {/* Search box for local filtering. */}
                  {filterOption !== undefined && (
                    <>
                      <Box
                        display={'flex'}
                        alignItems={'flex-end'}
                        padding={2}
                      >
                        <SearchIcon sx={{color: 'action.active', mr: 1, my: 0.5}}/>
                        <TextField
                          value={searchInputValue}
                          onChange={handleSearchInputValueChange}
                          variant={'standard'}
                          placeholder={t('select3.search_placeholder')}
                          autoFocus={open}
                          fullWidth
                          slotProps={{
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleSearchInputValueClear}
                                  >
                                    <ClearIcon fontSize={'small'}/>
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Box>

                      <Divider/>
                    </>
                  )}

                  {/* List of selectable options. */}
                  {filteredOptions === null ? (
                    // Considering grouping, if it was used.
                    (options.length > 0 && groups !== null ? // Grouped.
                    (<MenuList
                      id={`${componentId}-menu`}
                      aria-labelledby={`${componentId}-button`}
                      onKeyDown={handleListKeyDown}
                      // Providing children with a function because every item
                      // has a nested list, and I can't use fragments in MenuList.
                      children={((): React.ReactNode[] => {
                        const items: React.ReactNode[] = [];

                        // Button to select all elements.
                        if (multiple) {
                          const allChecked = !options
                            .some(option => !isOptionSelected(option));

                          items.push(
                            <MenuItem
                              key={'select-all'}
                              onClick={() => {
                                handleOptionsSelect(
                                  [...options],
                                  !allChecked,
                                );
                              }}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge={'start'}
                                  tabIndex={-1}
                                  checked={allChecked}
                                  disableRipple
                                  inputProps={{
                                    'aria-labelledby':
                                      `${componentId}-select-all-label`,
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                id={`${componentId}-select-all-label`}
                                primary={
                                  (rest as Select3MultipleValueProps)
                                    .selectAllMessage ?? t('select3.select_all')
                                }
                                primaryTypographyProps={{
                                  fontWeight: 'bold',
                                }}
                              />
                            </MenuItem>,
                          );
                        }

                        for (let i = 0; i < groups.length; i++) {
                          const checked = !groups[i].options
                            .some(option => !isOptionSelected(option));

                          items.push(
                            <MenuItem
                              key={`${groups[i].id.toString()}-header`}
                              title={groups[i].label}
                              // Only in multiple-value a group can be selected.
                              onClick={multiple ? () => {
                                handleOptionsSelect(
                                  [...groups[i].options],
                                  !checked,
                                );
                              } : undefined}
                              disabled={!multiple}
                            >
                              {/* Only in multiple-value a group can be selected. */}
                              {multiple && (
                                <ListItemIcon>
                                  <Checkbox
                                    edge={'start'}
                                    tabIndex={-1}
                                    checked={checked}
                                    disableRipple
                                    inputProps={{
                                      'aria-labelledby':
                                        `${componentId}-group-${groups[i].id}-label`,
                                    }}
                                  />
                                </ListItemIcon>
                              )}
                              <ListItemText
                                id={`${componentId}-group-${groups[i].id}-label`}
                                primary={groups[i].label}
                                primaryTypographyProps={{
                                  fontWeight: 'bold',
                                }}
                              />
                            </MenuItem>,
                          );

                          /**
                           * Nested list typically have a List element nested inside
                           * the List itself. However, I found out that doing this
                           * would prevent the user from navigating the sublist with
                           * their keyboard. I therefore chose to use a single, flat
                           * list and provide the sublist feel visually with padding.
                           */
                          for (let j = 0; j < groups[i].options.length; j++) {
                            items.push(
                              <MenuItem
                                key={`${groups[i].id.toString()}-body-${j}`}
                                title={getOptionLabel(groups[i].options[j])}
                                onClick={() => handleOptionClick(groups[i].options[j])}
                                selected={isOptionSelected(groups[i].options[j])}
                                sx={{
                                  paddingY: 1.5,
                                  // Only padding in multiple-value mode.
                                  paddingLeft: !multiple ? undefined : 6,
                                }}
                              >
                                <ListItemText
                                  primary={getOptionLabel(groups[i].options[j])}
                                />
                              </MenuItem>,
                            );
                          }
                        }

                        return items;
                      })()}
                    />) : // Ungrouped.
                    (options.length > 0 ? (<MenuList
                      id={`${componentId}-menu`}
                      aria-labelledby={`${componentId}-button`}
                      onKeyDown={handleListKeyDown}
                    >
                      {options.map((option, index) => (
                        <MenuItem
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          selected={isOptionSelected(option)}
                        >
                          {getOptionLabel(option)}
                        </MenuItem>
                      ))}
                    </MenuList>) : (<Typography>
                      {t('select3.no_result')}
                    </Typography>)))
                  ) : (
                    filteredOptions.length > 0 ? (
                      <MenuList
                        id={`${componentId}-menu`}
                        aria-labelledby={`${componentId}-button`}
                        onKeyDown={handleListKeyDown}
                      >
                        {filteredOptions.map((option, index) => (
                          <MenuItem
                            key={index}
                            onClick={() => handleOptionClick(option)}
                            selected={isOptionSelected(option)}
                          >
                            {getOptionLabel(option)}
                          </MenuItem>
                        ))}
                      </MenuList>
                    ) : (
                      <Typography>
                        {t('select3.no_result')}
                      </Typography>
                    )
                  )}
                </Box>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

export default Select3;
