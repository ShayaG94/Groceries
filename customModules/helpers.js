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

function getMeasureUnit(measureUnit) {
    if (measureUnit === "kg") {
        return measureUnit.toUpperCase();
    } else {
        return measureUnit[0].toUpperCase() + measureUnit.slice(1);
    }
}

function currecizePrice(price) {
    return `₪${price.toFixed(2)}`;
}

function uniticizeAmount(amount, measureUnit) {
    return `${amount.toFixed(3)} ${getMeasureUnit(measureUnit)}${amount > 1 ? "s" : ""}`;
}

function getTotalBought(product) {
    return product.purchases.reduce((acc, purchase) => acc + purchase.quantity, 0);
}

function getTotalSpent(product) {
    return product.purchases.reduce((acc, purchase) => acc + purchase.price, 0);
}

function getTotalConsumptionDays(product) {
    return product.purchases.reduce((acc, purchase) => {
        return acc + purchase.daysUsed;
    }, 0);
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
    const monthlyConsumption = (totalBought / totalConsumptionDays) * (365 / 12);
    const averageMonthlyCost = (totalSpent / getTotalUsageDays(product)) * (365 / 12);
    const monthlyConsumptionCost = (totalSpent / totalConsumptionDays) * (365 / 12);
    return { totalBought, totalSpent, averagePrice, totalConsumptionDays, monthlyConsumption, monthlyConsumptionCost, averageMonthlyCost };
}

function getPrettyStats(product) {
    const stats = { ...getProductStats(product) };
    stats.totalBought = uniticizeAmount(stats.totalBought, product.measureUnit);
    stats.totalSpent = currecizePrice(stats.totalSpent);
    stats.averagePrice = `${currecizePrice(stats.averagePrice)} / ${getMeasureUnit(product.measureUnit)}`;
    if (product.trackUsagePeriod) {
        if (!!stats.totalConsumptionDays) {
            stats.totalConsumptionDays = `${stats.totalConsumptionDays} days`;
            stats.monthlyConsumptionCost = currecizePrice(stats.monthlyConsumptionCost);
            stats.monthlyConsumption = uniticizeAmount(stats.monthlyConsumption, product.measureUnit);
        } else {
            stats.totalConsumptionDays = "Update Usage";
        }
    } else {
        delete stats.totalConsumptionDays;
        delete stats.monthlyConsumptionCost;
        delete stats.monthlyConsumption;
    }
    stats.averageMonthlyCost = currecizePrice(stats.averageMonthlyCost);
    return stats;
}

function getPurchaseInfo(purchase, product) {
    const info = {};
    info.amount = uniticizeAmount(purchase.quantity, product.measureUnit);
    info.price = currecizePrice(purchase.price);
    if (product.trackUsagePeriod) {
        if (!!purchase.daysUsed) {
            info.daysUsed = `${purchase.daysUsed} days`;
            info.monthlyConsumptionCost = currecizePrice((purchase.price / purchase.daysUsed) * (365 / 12));
        } else {
            info.forMoreInfo = "Update Usage \u2193";
        }
    }
    return info;
}

function sortByDate(date1, date2, direction) {
    const keyA = UTCizeDate(date1),
        keyB = UTCizeDate(date2);
    // Compare the 2 dates

    if (keyA < keyB) return -direction;
    if (keyA > keyB) return direction;
    return 0;
}

function getPurchase(purchase, list) {
    const { purchaseDate, store } = purchase;
    const sameDate = list.filter((purchase) => purchase.purchaseDate === purchaseDate);
    const sameStore = sameDate.filter((purchase) => purchase.store.name === store.name);
    const sameBranch = sameStore.filter((purchase) => purchase.store.branch === store.branch);
    if (!sameDate.length) {
        return false;
    } else if (!sameStore.length) {
        return false;
    } else if (!sameBranch.length) {
        return false;
    } else {
        [foundPurchase] = sameBranch;
        return foundPurchase;
    }
}

function getStorePurchases(purchases) {
    const storePurchases = [];
    for (let purchase of purchases) {
        const product = {
            title: purchase.productID.title,
            price: currecizePrice(purchase.price),
            amount: uniticizeAmount(purchase.quantity, purchase.productID.measureUnit),
        };
        const storePurchase = getPurchase(purchase, storePurchases);
        if (!storePurchase) {
            purchase.products = [];
            purchase.sum = purchase.price;
            purchase.prettySum = currecizePrice(purchase.sum);
            purchase.products.push(product);
            storePurchases.push(purchase);
        } else {
            storePurchase.sum += purchase.price;
            storePurchase.prettySum = currecizePrice(storePurchase.sum);
            storePurchase.products.push(product);
        }
    }
    return storePurchases;
}

module.exports = {
    UTCizeDate,
    calcDaysDifference,
    stringifyDate,
    getPrettyStats,
    getMeasureUnit,
    currecizePrice,
    uniticizeAmount,
    sortByDate,
    getPurchaseInfo,
    getStorePurchases,
};
