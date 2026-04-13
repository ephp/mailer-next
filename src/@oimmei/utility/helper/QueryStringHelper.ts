/**
 * Turns a query string from Next.js router.asPath into a key-value object.
 *
 * This exists because I found out that router.query is sometimes unreliable,
 * as it returns undefined when first rendering. This is OK when you're using
 * query parameters as effect dependencies; not so much when you need them
 * to initialize your component. router.asPath returns immediately instead.
 *
 * @link https://github.com/vercel/next.js/discussions/11484
 * @param asPath
 *
 * @deprecated asPath doesn't exist in Next.js app router.
 */
export function getQueryParamsFromAsPath<
  Type extends { [key: string]: string | string[] | undefined }
    = { [key: string]: string | string[] | undefined }
>(asPath: string): Type {
  const result: ReturnType<typeof getQueryParamsFromAsPath> = {};

  const urlSearchParams =
    new URLSearchParams(asPath.split('?')[1] ?? '');

  for (const [key, value] of Array.from(urlSearchParams.entries())) {
    if (result[key] === undefined) {
      // New key.
      result[key] = value;
    } else {
      // Existing key, this is an array of values.
      if (!Array.isArray(result[key])) {
        result[key] = [result[key] as string];
      }
      (result[key] as string[]).push(value);
    }
  }

  return result as Type;
}
