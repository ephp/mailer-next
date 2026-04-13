/**
 * Helper function to turn a minutes since midnight
 * value (600) into a display value (10:00).
 *
 * Returns the hour of day, meaning 00:00 to 23:59 using modules.
 */
export const getHourOfDayFromMinutes = (minutes: number | null): string => {
  if (minutes !== null) {
    return `${
      (
        Math.floor(
          Math.abs(minutes) / 60,
        ) % 24
      ).toString().padStart(2, '0')
    }:${
      (Math.abs(minutes) % 60).toString().padStart(2, '0')
    }`;
  } else {
    return '';
  }
};

/**
 * Helper function to turn a minute value (2000) into a display value (33:20h).
 */
export const getTimeStringFromMinutes = (minutes: number | null): string => {
  if (minutes !== null) {
    return `${minutes < 0 ? '-' : ''}${
      (Math.floor(Math.abs(minutes) / 60)).toString()
    }:${
      (Math.abs(minutes) % 60).toString().padStart(2, '0')
    }h`;
  } else {
    return '';
  }
};

/**
 * Helper function to turn a day value (3) into a display value (3d).
 */
export const getDayStringFromDays = (days: number | null): string => {
  if (days !== null) {
    // Displaying hours too, if the number is not an integer.
    return `${days < 0 ? '-' : ''}${
      Math.floor(Math.abs(days))
    }d${!Number.isInteger(days) ?
      ` ${Math.round(Math.abs(days) * 24) % 24}h` : ''}`;
  } else {
    return '';
  }
};
