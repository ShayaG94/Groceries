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

function getMeasureUnit(product) {
    if (product.measureUnit === "kg") {
        return product.measureUnit.toUpperCase();
    } else {
        return product.measureUnit[0].toUpperCase() + product.measureUnit.slice(1);
    }
}

function currecizePrice(price) {
    return `₪${price.toFixed(2)}`;
}

function uniticizeAmount(product, amount) {
    return `${amount.toFixed(3)} ${getMeasureUnit(product)}${amount > 1 ? "s" : ""}`;
}

function getTotalBought(product) {
    return product.purchases.reduce((acc, purchase) => acc + purchase.quantity, 0);
}

function getTotalSpent(product) {
    return product.purchases.reduce((acc, purchase) => acc + purchase.price, 0);
}

function getTotalConsumptionDays(product) {
    return product.purchases.reduce((acc, purchase) => acc + purchase.daysUsed, 0);
}

function getTotalUsageDays(product) {
    return (
        calcDaysDifference(
            UTCizeDate(product.purchases[0].purchaseDate),
            UTCizeDate(product.trackUsagePeriod ? product.purchases[product.purchases.length - 1].purchaseDate : "28/11/2020")
        ) + 1
    );
}

function getProductStats(product) {
    const totalBought = getTotalBought(product);
    const totalSpent = getTotalSpent(product);
    const averagePrice = totalSpent / totalBought;
    const totalConsumptionDays = getTotalConsumptionDays(product);
    const averageMonthlyCost = (totalSpent / getTotalUsageDays(product)) * (365 / 12);
    const monthlyConsumptionCost = (totalSpent / totalConsumptionDays) * (365 / 12);
    return { totalBought, totalSpent, averagePrice, totalConsumptionDays, monthlyConsumptionCost, averageMonthlyCost };
}

function getPrettyStats(product) {
    const stats = { ...getProductStats(product) };
    stats.totalBought = uniticizeAmount(product, stats.totalBought);
    stats.totalSpent = currecizePrice(stats.totalSpent);
    stats.averagePrice = `${currecizePrice(stats.averagePrice)} / ${getMeasureUnit(product)}`;
    stats.totalConsumptionDays = `${stats.totalConsumptionDays} days`;
    stats.averageMonthlyCost = currecizePrice(stats.averageMonthlyCost);
    if (product.trackUsagePeriod) {
        stats.monthlyConsumptionCost = currecizePrice(stats.monthlyConsumptionCost);
    } else {
        delete stats.monthlyConsumptionCost;
    }
    return stats;
}

module.exports = { UTCizeDate, calcDaysDifference, stringifyDate, getPrettyStats, getMeasureUnit, currecizePrice, uniticizeAmount };
