/**
 * This was commented out because it requires the react-dropzone
 * library, which is not part of the base project. If needed,
 * import it and uncomment to use the feature.
 *
 * @link https://github.com/react-dropzone/react-dropzone
 */

// import {FormikValues, useFormik} from 'formik';
// import {DropzoneOptions, DropzoneState, useDropzone} from 'react-dropzone';
// import {Upload, uploadFile} from '@Oimmei-Digital-Boutique/crema-components';
// import {useTranslations} from 'next-intl';
// import {useCallback} from 'react';
// import {useAsyncCallHelper2Actions} from '../services/context/AsyncCallHelper2Provider';
// import {oiFetch} from '../services/auth';
//
// export type FormikImageGalleryUploadParams<Type extends FormikValues, UploadType = Upload> = {
//   /**
//    * Name of the form field.
//    */
//   fieldName: string
//
//   maxFileSizeMb: number
//
//   /**
//    * Accepted mime type. Common image formats by default; can be restricted if needed.
//    */
//   acceptedFileMimeType?: {
//     'image/jpeg'?: any
//     'image/png'?: any
//     'image/gif'?: any
//   }
//
//   /**
//    * Function to normalize or convert between Uploads and custom format, if needed.
//    */
//   convertUpload?: (upload: Upload) => UploadType
// } & Pick<ReturnType<typeof useFormik<Type>>, 'setValues' | 'setFieldError'>
//
// /**
//  * Custom hook returning the dropzone for uploading an image gallery into a Formik form.
//  */
// function useFormikImageGalleryUpload<Type extends FormikValues, UploadType = Upload>(
//   {
//     fieldName,
//     maxFileSizeMb,
//     acceptedFileMimeType = {
//       'image/jpeg': true,
//       'image/png': true,
//       'image/gif': true,
//     },
//     setValues,
//     setFieldError,
//   }: FormikImageGalleryUploadParams<Type, UploadType>,
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
//         // Uploading every accepted file.
//         const promises = acceptedFiles.map(acceptedFile => uploadFile(oiFetch, acceptedFile));
//
//         performAsyncCall(Promise.allSettled(promises))
//           .then(results => {
//             // Processing the results one by one.
//             const newFieldValues: UploadType[] = [];
//             const newErrors: string[] = [];
//
//             for (const result of results) {
//               if (result.status === 'fulfilled') {
//                 // Upload successful.
//                 const upload = result.value;
//
//                 newFieldValues.push(upload as UploadType);
//               } else {
//                 // Upload failed.
//                 console.error(result.reason);
//
//                 newErrors.push(t('common.upload_error.upload', {ns: 'messages'}));
//               }
//             }
//
//             setValues(v => ({
//               ...v,
//               [fieldName]: [...v[fieldName], ...newFieldValues],
//             }));
//
//             if (newErrors.length > 0) {
//               setFieldError(fieldName, newErrors.join('\n'));
//             }
//           });
//       }
//     },
//     [
//       acceptedFileMimeType,
//       fieldName,
//       maxFileSizeMb,
//       performAsyncCall,
//       setFieldError,
//       setValues,
//       t,
//     ],
//   );
//
//   return useDropzone(
//     {
//       accept: acceptedFileMimeType,
//       multiple: true,
//       maxSize: maxFileSizeMb * 1024 * 1024,
//       onDrop: onFileDrop,
//     },
//   );
// }
//
// export default useFormikImageGalleryUpload;
