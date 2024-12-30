class Characteristic {
    constructor({
        characteristicId,
        name,
        dataType,
        unit,
        frequency,
        source,
        confidenceLevel,
        dataRetentionRule
    }) {
        this.characteristicId = characteristicId;
        this.name = name;
        this.dataType = dataType;
        this.unit = unit;
        this.frequency = frequency;
        this.source = source;
        this.confidenceLevel = confidenceLevel;
        this.dataRetentionRule = dataRetentionRule;
    }
}

module.exports = Characteristic;