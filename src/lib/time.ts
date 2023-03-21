export function getTimeDifference(timestamp) {
    const currentDate = new Date();
    const givenDate = new Date(timestamp);
    const differenceInMs = currentDate - givenDate;

    const differenceInMinutes = Math.floor(differenceInMs / (1000 * 60));
    if (differenceInMinutes < 60) {
        return `${differenceInMinutes}m`;
    }

    const differenceInHours = Math.floor(differenceInMs / (1000 * 60 * 60));
    if (differenceInHours < 24) {
        return `${differenceInHours}h`;
    }

    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
    if (differenceInDays < 30) {
        return `${differenceInDays}d`;
    }

    const differenceInMonths = Math.floor(differenceInMs / (1000 * 60 * 60 * 24 * 30));
    return `${differenceInMonths}mo`;
}