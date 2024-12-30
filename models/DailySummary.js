class DailySummary {
    constructor({
        summaryId,
        userId,
        characteristicId,
        date,
        finalValue,
        source,
        confidenceLevel
    }) {
        this.summaryId = summaryId;
        this.userId = userId;
        this.characteristicId = characteristicId;
        this.date = date;
        this.finalValue = finalValue;
        this.source = source;
        this.confidenceLevel = confidenceLevel;
    }
}

module.exports = DailySummary;