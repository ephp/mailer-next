/**
 * This was commented out because it requires the react-dropzone
 * library, which is not part of the base project. If needed,
 * import it and uncomment to use the feature.
 *
 * @link https://github.com/react-dropzone/react-dropzone
 */

// import {useCallback} from 'react';
// import {useTranslations} from 'next-intl';
// import {DropzoneOptions, DropzoneState, useDropzone} from 'react-dropzone';
// import {uploadFile} from '@Oimmei-Digital-Boutique/crema-components';
// import {oiFetch} from '../services/auth';
// import {FormikValues, useFormik} from 'formik';
// import {useAsyncCallHelper2Actions} from '../services/context/AsyncCallHelper2Provider';
//
// export type FormikSingleFileUploadParams<T extends FormikValues> = {
//   /**
//    * Name of the form field.
//    */
//   fieldName: string
//
//   acceptedFileMimeType: {
//     [key: string]: any
//   }
//
//   maxFileSizeMb: number
// } & Pick<ReturnType<typeof useFormik<T>>, 'setValues' | 'setFieldError'>
//
// /**
//  * Custom hook returning the dropzone for uploading a single file into a Formik form.
//  */
// function useFormikSingleFileUpload<T extends FormikValues>(
//   {
//     fieldName,
//     acceptedFileMimeType,
//     maxFileSizeMb,
//     setValues,
//     setFieldError,
//   }: FormikSingleFileUploadParams<T>,
// ): DropzoneState {
//   const t = useTranslations('messages');
//
//   const {performAsyncCall} = useAsyncCallHelper2Actions();
//
//   // onDrop callback for file uploading. Using the
//   // hook because it's shown like this in the docs.
//   // https://react-dropzone.js.org/#usage
//   const onFileDrop = useCallback<NonNullable<DropzoneOptions['onDrop']>>(
//     (acceptedFiles, fileRejections) => {
//       if (fileRejections.length > 0) {
//         // Showing file errors through Formik.
//         // The input is not multiple, so the array should only have one element.
//         fileRejections.map(fileRejection => {
//           // A single file can have several errors. Concatenating every message.
//           const errorMessages: string[] = [];
//
//           fileRejection.errors.map(fileError => {
//             switch (fileError.code) {
//               case "file-invalid-type":
//                 errorMessages.push(t('common.upload_error.mimeType', {
//                   ns: 'messages',
//                   fileName: fileRejection.file.name,
//                   mimeTypes: Object.keys(acceptedFileMimeType).join(', '),
//                 }));
//                 break;
//               case "file-too-large":
//                 errorMessages.push(t('common.upload_error.maxSize', {
//                   ns: 'messages',
//                   fileName: fileRejection.file.name,
//                   maxSize: maxFileSizeMb + 'MB',
//                 }));
//                 break;
//               default:
//                 errorMessages.push(t('common.upload_error.generic', {
//                   ns: 'messages',
//                   fileName: fileRejection.file.name,
//                   message: fileError.message,
//                 }));
//                 break;
//             }
//           });
//
//           setFieldError(
//             fieldName,
//             errorMessages.join("\n"),
//           );
//         });
//       } else {
//         setFieldError(
//           fieldName,
//           undefined,
//         );
//       }
//
//       if (acceptedFiles.length > 0) {
//         // Uploading accepted files. Only dealing with singular
//         // uploads, since multiple files is disabled for this.
//         acceptedFiles.map(acceptedFile => {
//           performAsyncCall(
//             uploadFile(oiFetch, acceptedFile, {
//               params: {
//                 format: "only_original",
//               },
//             }),
//           )
//             .then(upload => {
//               setValues(v => ({
//                 ...v,
//                 [fieldName]: upload,
//               }));
//             })
//             .catch(error => {
//               console.error(error);
//
//               setFieldError(
//                 fieldName,
//                 t('common.upload_error.upload', {ns: 'messages'}),
//               );
//             });
//         });
//       }
//     },
//     [
//       t,
//       fieldName,
//       setFieldError,
//       setValues,
//       acceptedFileMimeType,
//       maxFileSizeMb,
//       performAsyncCall,
//     ],
//   );
//
//   return useDropzone(
//     {
//       accept: acceptedFileMimeType,
//       multiple: false,
//       maxSize: maxFileSizeMb * 1024 * 1024,
//       onDrop: onFileDrop,
//     },
//   );
// }
//
// export default useFormikSingleFileUpload;
