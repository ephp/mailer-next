/**
 * Returns props for tabs accessibility.
 *
 * The IDs must match with {@link a11yTabPanelProps}.
 *
 * @param prefix
 * @param index
 */
export function a11yTabProps<
  TabValue extends string | number = string
>(
  prefix: string,
  index: TabValue,
) {
  return {
    id: `${prefix}-tab-${index.toString()}`,
    'aria-controls': `${prefix}-tabpanel-${index.toString()}`,
  };
}

/**
 * Returns props for tab panels accessibility.
 *
 * The IDs must match with {@link a11yTabProps}.
 *
 * @param prefix
 * @param index
 */
export function a11yTabPanelProps<
  TabValue extends string | number = string
>(
  prefix: string,
  index: TabValue,
) {
  return {
    id: `${prefix}-tabpanel-${index.toString()}`,
    'aria-labelledby': `${prefix}-tab-${index.toString()}`,
  };
}
