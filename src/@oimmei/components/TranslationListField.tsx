/**
 * Commented as it requires a language to be defined in the models.
 */

// import React, {ReactElement, useId, useState} from 'react';
// import {
//   defaultLanguage as defaultProjectLanguage,
//   Language,
// } from '../../types/models/Language';
// import {useTranslations} from 'next-intl';
// import Button, {ButtonProps} from '@mui/material/Button';
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import Box, {BoxProps} from '@mui/material/Box';
// import Tabs, {TabsProps} from '@mui/material/Tabs';
// import Tab, {TabProps} from '@mui/material/Tab';
// import {a11yTabProps} from '../utility/helper/TabHelper';
// import IconButton from '@mui/material/IconButton';
// import AddIcon from '@mui/icons-material/Add';
// import TabPanel from './TabPanel';
// import Divider from '@mui/material/Divider';
// import Tooltip from '@mui/material/Tooltip';
// import {FormikErrors, getIn} from 'formik';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import FormHelperText from '@mui/material/FormHelperText';
// import Badge from '@mui/material/Badge';
// import {lighten} from '@mui/material';
// import {ArraySchema, ObjectSchema} from 'yup';
//
// /**
//  * Base translation type.
//  */
// export interface Translation {
//   language: Language;
// }
//
// /**
//  * Base translation form component type.
//  */
// export interface TranslationFormComponentProps<
//   TranslationType extends Translation> {
//   translation: TranslationType;
//
//   onTranslationChange: (
//     language: Language,
//     newTranslation: React.SetStateAction<TranslationType>,
//   ) => void;
//
//   errors: FormikErrors<TranslationType>;
//
//   validationSchema?: ObjectSchema<TranslationType>;
// }
//
// export type TranslationFormComponent<TranslationType extends Translation> =
//   React.FC<TranslationFormComponentProps<TranslationType>>;
//
// /**
//  * Subcomponent to select the original language, in case none is.
//  */
// function OriginalLanguageSelector(
//   {availableLanguages, onLanguageSelected, ButtonProps}: {
//     availableLanguages: readonly Language[]
//
//     onLanguageSelected: (language: Language) => void
//
//     ButtonProps?: Partial<ButtonProps>
//   },
// ): ReactElement | null {
//   const componentId = useId();
//
//   const t = useTranslations('translation');
//
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const open = Boolean(anchorEl);
//   const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
//     setAnchorEl(event.currentTarget);
//   };
//   const handleClose = (): void => {
//     setAnchorEl(null);
//   };
//
//   return (
//     <>
//       <Button
//         id={`translation-selector-button-${componentId}`}
//         variant={'contained'}
//         aria-controls={open ?
//           `translation-selector-${componentId}` : undefined}
//         aria-haspopup="true"
//         aria-expanded={open ? 'true' : undefined}
//         onClick={handleClick}
//         endIcon={<ExpandMoreIcon/>}
//         {...(ButtonProps ?? {})}
//       >
//         {t('translation_list_field.btn.pick_original_language')}
//       </Button>
//
//       <Menu
//         id={`translation-selector-${componentId}`}
//         anchorEl={anchorEl}
//         open={open}
//         onClose={handleClose}
//         MenuListProps={{
//           'aria-labelledby': `translation-selector-button-${componentId}`,
//         }}
//         anchorOrigin={{
//           vertical: 'bottom',
//           horizontal: 'right',
//         }}
//         transformOrigin={{
//           vertical: 'top',
//           horizontal: 'right',
//         }}
//       >
//         {availableLanguages.map(language => (
//           <MenuItem
//             key={language}
//             onClick={() => onLanguageSelected(language)}
//           >
//             {t(language, {ns: 'language'})}
//           </MenuItem>
//         ))}
//       </Menu>
//     </>
//   );
// }
//
// /**
//  * Subcomponent for a single translation slot (meaning the space
//  * in which a translation form is going to be displayed).
//  */
// function TranslationFormSlot<TranslationType extends Translation>(
//   {
//     translations,
//     TranslationForm,
//     onTranslationAdd,
//     onTranslationChange,
//     error,
//     availableLanguages,
//     currentTab,
//     onCurrentTabChange,
//     validationSchema,
//     TabsProps,
//     TabProps,
//   }: {
//     translations: TranslationType[]
//
//     TranslationForm: TranslationFormComponent<TranslationType>
//
//     onTranslationAdd: (language: Language) => void
//
//     onTranslationChange: TranslationFormComponentProps<TranslationType>['onTranslationChange']
//
//     error: string | string[] | FormikErrors<TranslationType[]> | undefined
//
//     availableLanguages: readonly Language[]
//
//     currentTab: Language
//
//     onCurrentTabChange: (event: React.SyntheticEvent, newValue: Language) => void
//
//     validationSchema?: ArraySchema<TranslationType[], any>
//
//     defaultLanguage?: Language
//
//     TabsProps?: Partial<TabsProps>
//
//     TabProps?: Partial<TabProps> | ((language: Language) => Partial<TabProps>)
//   },
// ): ReactElement | null {
//   const componentId = useId();
//
//   const t = useTranslations('translation');
//
//   // Add language menu state and callback.
//   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
//   const open = Boolean(anchorEl);
//   const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
//     setAnchorEl(event.currentTarget);
//   };
//   const handleClose = (): void => {
//     setAnchorEl(null);
//   };
//
//   return (
//     <>
//       <Box
//         sx={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           borderBottom: 1,
//           borderColor: 'divider',
//           marginBottom: 3,
//         }}
//       >
//         <Tabs
//           value={currentTab}
//           onChange={onCurrentTabChange}
//           aria-label={t('translation_list_field.tabs_label')}
//           {...(TabsProps ?? {})}
//         >
//           {translations.map((translation, index) => {
//             // If this specific translation has an error of any kind,
//             // showing the tab in a different color.
//             const hasError = getIn(error, `[${index}]`);
//
//             return (
//               <Tab
//                 key={translation.language}
//                 label={
//                   hasError ? (
//                     <Badge color={'error'} variant={'dot'}>
//                       {t(translation.language, {ns: 'language'})}
//                     </Badge>
//                   ) : t(translation.language, {ns: 'language'})
//                 }
//                 value={translation.language}
//                 {
//                   ...((
//                     typeof TabProps === 'function' ?
//                       TabProps(translation.language) : TabProps
//                   ) ?? {})
//                 }
//                 {...a11yTabProps(componentId, translation.language)}
//               />
//             );
//           })}
//         </Tabs>
//
//         {translations.length < availableLanguages.length && (
//           <Box>
//             <Tooltip title={t('translation_list_field.btn.add_language')}>
//               <IconButton
//                 id={`add-translation-button-${componentId}`}
//                 aria-controls={open ?
//                   `add-translation-${componentId}` : undefined}
//                 aria-haspopup="true"
//                 aria-expanded={open ? 'true' : undefined}
//                 onClick={handleClick}
//               >
//                 <AddIcon/>
//               </IconButton>
//             </Tooltip>
//
//             <Menu
//               id={`add-translation-${componentId}`}
//               anchorEl={anchorEl}
//               open={open}
//               onClose={handleClose}
//               MenuListProps={{
//                 'aria-labelledby': `add-translation-button-${componentId}`,
//               }}
//             >
//               {
//                 availableLanguages
//                   .filter(lang => !translations
//                     .some(translation => translation.language === lang))
//                   .map(lang => (
//                     <MenuItem
//                       key={lang}
//                       onClick={() => onTranslationAdd(lang)}
//                     >
//                       {t(lang, {ns: 'language'})}
//                     </MenuItem>
//                   ))
//               }
//             </Menu>
//           </Box>
//         )}
//       </Box>
//
//       {translations.map((translation, index) => {
//         /**
//          * If errors[index] is a string or string[], it must be
//          * displayed at this level; passed through if it's an object.
//          *
//          * Not considering the technically possible object[], as to my knowledge
//          * that only happens if the translation itself is an array; I can't see
//          * any use case in which that could happen.
//          */
//         const translationError = getIn(error, `[${index}]`);
//         const translationHasError = translationError
//           && typeof translationError === 'string' && Array.isArray(translationError);
//
//         return (
//           <TabPanel
//             key={translation.language}
//             prefix={componentId}
//             index={translation.language}
//             currentTab={currentTab}
//             aria-describedby={
//               translationHasError && translation.language ?
//                 `translation-error-${componentId}-${translation.language}` : undefined
//             }
//           >
//             {translationHasError && translation.language === currentTab && (
//               <FormHelperText
//                 id={`translation-error-${componentId}-${translation.language}`}
//                 sx={{
//                   color: (theme) => (theme.vars ?? theme).palette.error.main,
//                   marginX: '14px',
//                   whiteSpace: 'pre-wrap', // Respect newlines.
//                 }}
//               >
//                 {Array.isArray(error) ? error.join('\n') : error}
//               </FormHelperText>
//             )}
//
//             {translation.language === currentTab && (
//               <TranslationForm
//                 translation={translation}
//                 onTranslationChange={onTranslationChange}
//
//                 // Passing the error through, only if it's an object.
//                 errors={typeof translationError === 'object' ? translationError : {}}
//
//                 validationSchema={
//                   (validationSchema?.innerType as ObjectSchema<TranslationType> | undefined)
//                 }
//               />
//             )}
//           </TabPanel>
//         );
//       })}
//     </>
//   );
// }
//
// /**
//  * Subcomponent for the single translation form view.
//  */
// function TranslationFormSingleView<TranslationType extends Translation>(
//   {...rest}: Omit<React.ComponentProps<
//     typeof TranslationFormSlot<TranslationType>>, 'currentTab' | 'onCurrentTabChange'>,
// ): ReactElement | null {
//   const [currentTab, setCurrentTab] = useState<Language>(
//     () => rest.translations[0]?.language ?? defaultProjectLanguage,
//   );
//
//   return (
//     <TranslationFormSlot<TranslationType>
//       {...rest}
//       currentTab={currentTab}
//       onCurrentTabChange={(event, newValue) => setCurrentTab(newValue)}
//     />
//   );
// }
//
// /**
//  * Subcomponent for the split translation form view.
//  */
// function TranslationFormSplitView<TranslationType extends Translation>(
//   {...rest}: Omit<React.ComponentProps<
//     typeof TranslationFormSlot<TranslationType>>, 'currentTab' | 'onCurrentTabChange'>,
// ): ReactElement | null {
//   const [currentTabTuple, setCurrentTabTuple] =
//     useState<[Language, Language]>(
//       () => ([
//         rest.translations[0]?.language ?? defaultProjectLanguage,
//         rest.translations[1]?.language ?? defaultProjectLanguage,
//       ]),
//     );
//
//   const handleCurrentTabIndexChange = (language: Language, index: 0 | 1): void => {
//     setCurrentTabTuple(tuple => {
//       const newValue: typeof tuple = [...tuple];
//
//       // Setting the new current tab.
//       newValue[index] = language;
//
//       // If the language is the same, switching it with the old one.
//       if (newValue[0] === newValue[1]) {
//         newValue[(index + 1) % 2] = tuple[index];
//       }
//
//       return newValue;
//     });
//   };
//
//   return (
//     <Box
//       display={'flex'}
//       gap={'16px'}
//     >
//       <Box flex={'1'}>
//         <TranslationFormSlot<TranslationType>
//           {...rest}
//           currentTab={currentTabTuple[0]}
//           onCurrentTabChange={(event, newValue) => {
//             handleCurrentTabIndexChange(newValue, 0);
//           }}
//         />
//       </Box>
//
//       <Divider orientation={'vertical'} flexItem/>
//
//       <Box flex={'1'}>
//         <TranslationFormSlot<TranslationType>
//           {...rest}
//           currentTab={currentTabTuple[1]}
//           onCurrentTabChange={(event, newValue) => {
//             handleCurrentTabIndexChange(newValue, 1);
//           }}
//         />
//       </Box>
//     </Box>
//   );
// }
//
// /**
//  * Field for a collection of translations inside a form.
//  */
// function TranslationListField<TranslationType extends Translation>(
//   {
//     translations,
//     TranslationForm,
//     originalLanguage,
//     onOriginalLanguageSelected,
//     onTranslationAdd,
//     onTranslationChange,
//     error,
//     availableLanguages,
//     validationSchema,
//     BoxProps,
//   }: {
//     translations: TranslationType[]
//
//     TranslationForm: TranslationFormComponent<TranslationType>
//
//     originalLanguage: Language | null
//
//     onOriginalLanguageSelected: (language: Language) => void
//
//     onTranslationAdd: (language: Language) => void
//
//     onTranslationChange: TranslationFormComponentProps<TranslationType>['onTranslationChange']
//
//     error: string | string[] | FormikErrors<TranslationType[]> | undefined
//
//     availableLanguages: readonly Language[]
//
//     validationSchema?: ArraySchema<TranslationType[], any>
//
//     BoxProps?: BoxProps
//   },
// ): ReactElement | null {
//   const componentId = useId();
//
//   /**
//    * TRUE if an error should be displayed at this level.
//    *
//    * Contrary to what the TypeScript definition says, `error` can
//    * be a string[] as well as an object[]. In this second case,
//    * the error belongs to a deeper level and shouldn't be displayed here.
//    */
//   const hasError = error && (typeof error === 'string' || (
//     Array.isArray(error) && error.some(errorItem => typeof errorItem === 'string')
//   ));
//
//   // Component to display the error.
//   const formHelperText = (
//     <FormHelperText
//       id={`translation-list-error-${componentId}`}
//       sx={{
//         color: (theme) => (theme.vars ?? theme).palette.error.main,
//         marginX: '14px',
//         whiteSpace: 'pre-wrap', // Respect newlines.
//       }}
//     >
//       {
//         Array.isArray(error) ? error
//           .filter(errorItem => typeof errorItem === 'string')
//           .join('\n') : error
//       }
//     </FormHelperText>
//   );
//
//   if (originalLanguage === null || translations.length === 0) {
//     // An original language has to be selected.
//     const handleOriginalLanguageSelected = (language: Language): void => {
//       // Selecting the original language and adding the related translation.
//       onOriginalLanguageSelected(language);
//       onTranslationAdd(language);
//     };
//
//     return (
//       <Box {...(BoxProps ?? {})}>
//         <OriginalLanguageSelector
//           availableLanguages={availableLanguages}
//           onLanguageSelected={handleOriginalLanguageSelected}
//           ButtonProps={{
//             color: hasError ? 'error' : undefined,
//             'aria-describedby': hasError ?
//               `translation-list-error-${componentId}` : undefined,
//           }}
//         />
//
//         {hasError && formHelperText}
//       </Box>
//     );
//   } else {
//     // An original language is selected, displaying the translation form(s).
//     const translationFormSlotErrorProps: Partial<React.ComponentProps<
//       typeof TranslationFormSlot<TranslationType>>> = hasError ? {
//       TabsProps: {
//         TabIndicatorProps: {
//           sx: {
//             backgroundColor: theme => (theme.vars ?? theme).palette.error.main,
//           },
//         },
//       },
//       TabProps: {
//         sx: {
//           color: theme => lighten((theme.vars ?? theme).palette.error.main, 0.2),
//           '&.Mui-selected': {
//             color: theme => (theme.vars ?? theme).palette.error.main,
//           },
//         },
//         'aria-describedby': hasError ?
//           `translation-list-error-${componentId}` : undefined,
//       },
//     } : {};
//
//     return (
//       <Box {...(BoxProps ?? {})}>
//         {hasError && formHelperText}
//         {translations.length === 1 ? (
//           // Only one translation, displaying it full width.
//           <TranslationFormSingleView<TranslationType>
//             translations={translations}
//             TranslationForm={TranslationForm}
//             availableLanguages={availableLanguages}
//             onTranslationAdd={onTranslationAdd}
//             onTranslationChange={onTranslationChange}
//             error={error}
//             validationSchema={validationSchema}
//             {...translationFormSlotErrorProps}
//           />
//         ) : (
//           // Two or more translations, displaying it in a split view.
//           <TranslationFormSplitView
//             translations={translations}
//             TranslationForm={TranslationForm}
//             availableLanguages={availableLanguages}
//             onTranslationAdd={onTranslationAdd}
//             onTranslationChange={onTranslationChange}
//             error={error}
//             validationSchema={validationSchema}
//             {...translationFormSlotErrorProps}
//           />
//         )}
//       </Box>
//     );
//   }
// }
//
// export default TranslationListField;
