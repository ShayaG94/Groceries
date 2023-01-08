function UTCizeDate(date) {
    const [day, month, year] = date.split("/");
    rawDate = new Date(year, month - 1, day);
    return Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate());
}
function calcDaysDifference(startDate, endDate) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    return Math.floor((endDate - startDate) / _MS_PER_DAY);
}

function stringifyDate(date) {
    if (date) {
        const [year, month, day] = date.split("-");
        return `${day}/${month}/${year}`;
    } else return "";
}

module.exports = { UTCizeDate, calcDaysDifference, stringifyDate };
