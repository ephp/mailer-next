import {
  SchemaDescription,
  SchemaFieldDescription,
  SchemaObjectDescription,
} from 'yup';

/**
 * Given a validation schema and a non-nested field, returns TRUE if this field is required.
 *
 * @param validationSchemaDescription
 * @param field
 */
export function isYupFieldRequired<Type = any>(
  validationSchemaDescription: SchemaDescription | undefined,
  field: keyof Type,
): boolean {
  if (validationSchemaDescription !== undefined) {
    if ('innerType' in validationSchemaDescription) {
      // Array descriptor.
      return false === (
        ((
          validationSchemaDescription.innerType as SchemaObjectDescription | undefined
        )?.fields[field] as SchemaDescription | undefined)?.optional
      );
    } else if ('fields' in validationSchemaDescription) {
      // Object descriptor.
      return false === ((
        validationSchemaDescription as SchemaObjectDescription | undefined
      )?.fields[field] as SchemaDescription | undefined)?.optional;
    }
  }

  // No description no required field.
  // https://www.youtube.com/watch?v=GKIjjE3pAMY&ab_channel=GeorgeTClooney
  return false;
}

/**
 * Inner helper for {@link isYupFieldGroupRequired}.
 *
 * @param schemaFieldDescription
 * @param value
 */
function isYupFieldRequiredRecursive(
  schemaFieldDescription: SchemaFieldDescription | SchemaFieldDescription[] | undefined,
  value: any,
): boolean {
  // The array case is not supported.
  // It should only happen for arrays of arrays: a very rare case in form validation.
  if (schemaFieldDescription !== undefined && !Array.isArray(schemaFieldDescription)) {
    if ('innerType' in schemaFieldDescription) {
      // This field is an array.
      // If the array itself is required, returning TRUE;
      // if the array is not required, a nested field may
      // be, but those should only be considered if the
      // value is not empty; skipping them otherwise.
      if (schemaFieldDescription?.optional === false) {
        return true;
      } else if (Array.isArray(value) && value.length > 0) {
        return isYupFieldRequiredRecursive(
          schemaFieldDescription.innerType,
          value?.[0],
        );
      }
    } else if ('fields' in schemaFieldDescription) {
      // This field is an object.
      // Returning TRUE if the object itself is non-optional; recursion otherwise.
      if (schemaFieldDescription?.optional === false) {
        return true;
      } else {
        let result = false;

        for (const [key, value] of Object.entries(schemaFieldDescription.fields)) {
          result = isYupFieldRequiredRecursive(
            schemaFieldDescription.fields[key],
            value?.[key as keyof typeof value],
          );
        }

        return result;
      }
    } else if ('optional' in schemaFieldDescription) {
      // This is a regular, possibly scalar, field.
      return schemaFieldDescription?.optional === false;
    }
  }

  // No description no required field.
  // https://www.youtube.com/watch?v=GKIjjE3pAMY&ab_channel=GeorgeTClooney
  return false;
}

/**
 * Given a description, a group of root fields and a related values wrapper,
 * returns TRUE if any of the fields in the group contain required data.
 *
 * @param validationSchemaDescription
 * @param fieldGroup
 * @param values
 */
export function isYupFieldGroupRequired<Type extends {
  [key: string]: any
} = { [key: string]: any }>(
  validationSchemaDescription: SchemaObjectDescription,
  fieldGroup: (keyof Type)[],
  values: Partial<Type>,
): boolean {
  let result = false;

  // Considering every field and starting a verification for it;
  // stopping as soon as a required field is found.
  let i = 0;
  while (i < fieldGroup.length && !result) {
    const schemaFieldDescription = validationSchemaDescription.fields[fieldGroup[i] as string];

    result = isYupFieldRequiredRecursive(
      schemaFieldDescription,
      values[fieldGroup[i]],
    );

    i++;
  }

  return result;
}
