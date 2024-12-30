class WeeklySummary {
    constructor({
        summaryId,
        userId,
        characteristicId,
        weekStartDate,
        weekEndDate,
        averageValue,
        totalValue,
        maxValue,
        primarySource
    }) {
        this.summaryId = summaryId;
        this.userId = userId;
        this.characteristicId = characteristicId;
        this.weekStartDate = weekStartDate;
        this.weekEndDate = weekEndDate;
        this.averageValue = averageValue;
        this.totalValue = totalValue;
        this.maxValue = maxValue;
        this.primarySource = primarySource;
    }
}

module.exports = WeeklySummary;