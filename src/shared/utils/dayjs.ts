import dayjs from 'dayjs';

/**
 * This file is a wrapper for the dayjs library, adding the
 * plugins it needs to function properly in the project.
 *
 * **All files in the project must import this to use dayjs**.
 * Types and other exports from the base library are fine.
 *
 * If more plugins are needed, or if the language
 * changes, add the related code in here.
 */

// Adding the weekOfYear plugin so the month picker works.
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

export default dayjs;
