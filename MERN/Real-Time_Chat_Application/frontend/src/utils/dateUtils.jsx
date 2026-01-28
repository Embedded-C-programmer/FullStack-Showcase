import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

export const formatDate = (date) => {
    if (isToday(date)) {
        return 'Today';
    }

    if (isYesterday(date)) {
        return 'Yesterday';
    }

    if (isThisWeek(date)) {
        return format(date, 'EEEE');
    }

    if (isThisYear(date)) {
        return format(date, 'MMM d');
    }

    return format(date, 'MMM d, yyyy');
};

export const formatTime = (date) => {
    return format(date, 'HH:mm');
};

export const formatDateTime = (date) => {
    return format(date, 'MMM d, yyyy HH:mm');
};