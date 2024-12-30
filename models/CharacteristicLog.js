class CharacteristicLog {
    constructor({
        logId,
        userId,
        characteristicId,
        timestamp,
        referenceDay,
        value,
        source,
        confidenceLevel
    }) {
        this.logId = logId;
        this.userId = userId;
        this.characteristicId = characteristicId;
        this.timestamp = timestamp;
        this.referenceDay = referenceDay;
        this.value = value;
        this.source = source;
        this.confidenceLevel = confidenceLevel;
    }
}

module.exports = CharacteristicLog;