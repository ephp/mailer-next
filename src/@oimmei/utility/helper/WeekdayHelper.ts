export const weekdayOptions = [0, 1, 2, 3, 4, 5, 6] as const;

export type Weekday = typeof weekdayOptions[number];

export const getWeekdayName = (
  weekday: Weekday,
): string => {
  switch (weekday) {
    case 0:
      return 'sunday';
    case 1:
      return 'monday';
    case 2:
      return 'tuesday';
    case 3:
      return 'wednesday';
    case 4:
      return 'thursday';
    case 5:
      return 'friday';
    case 6:
      return 'saturday';
  }
};
