const Characteristic = require('../models/Characteristic');
const CharacteristicLog = require('../models/CharacteristicLog');
const DailySummary = require('../models/DailySummary');
const WeeklySummary = require('../models/WeeklySummary');
const DateUtils = require('../utils/DateUtils');

class HealthParameterService {
    constructor() {
        this.characteristics = new Map();
        this.characteristicLogs = [];
        this.weeklySummaries = [];
        this.dailySummaries = [];
    }

    /**
     * @param {Characteristic} characteristic
     */
    addCharacteristic(characteristic) {
        this.characteristics.set(characteristic.characteristicId, characteristic);
    }

    getCharacteristic(characteristicId) {
        return this.characteristics.get(characteristicId);
    }

    /**
     * @param {CharacteristicLog} log
     */
    addCharacteristicLog(log) {
        this.characteristicLogs.push(log);
        this.updateDailySummary(log);
        this.updateWeeklySummary(log);
    }

    updateDailySummary(log) {
        const existingSummary = this.dailySummaries.find(
            summary => 
                summary.userId === log.userId &&
                summary.characteristicId === log.characteristicId &&
                summary.date.getTime() === log.referenceDay.getTime()
        );

        if (!existingSummary || log.confidenceLevel > existingSummary.confidenceLevel) {
            if (existingSummary) {
                const index = this.dailySummaries.indexOf(existingSummary);
                this.dailySummaries.splice(index, 1);
            }

            const newSummary = new DailySummary({
                summaryId: Date.now().toString(),
                userId: log.userId,
                characteristicId: log.characteristicId,
                date: log.referenceDay,
                finalValue: log.value,
                source: log.source,
                confidenceLevel: log.confidenceLevel
            });

            this.dailySummaries.push(newSummary);
        }
    }

    updateWeeklySummary(log) {
        const weekStart = DateUtils.getWeekStart(log.referenceDay);
        const weekEnd = DateUtils.getWeekEnd(log.referenceDay);

        const relevantDailySummaries = this.dailySummaries.filter(
            summary =>
                summary.userId === log.userId &&
                summary.characteristicId === log.characteristicId &&
                summary.date >= weekStart &&
                summary.date <= weekEnd
        );

        if (relevantDailySummaries.length > 0) {
            const values = relevantDailySummaries.map(s => s.finalValue);
            const averageValue = values.reduce((a, b) => a + b) / values.length;
            const totalValue = values.reduce((a, b) => a + b);
            const maxValue = Math.max(...values);
            
            const existingSummary = this.weeklySummaries.find(
                summary =>
                    summary.userId === log.userId &&
                    summary.characteristicId === log.characteristicId &&
                    summary.weekStartDate.getTime() === weekStart.getTime()
            );

            if (existingSummary) {
                const index = this.weeklySummaries.indexOf(existingSummary);
                this.weeklySummaries.splice(index, 1);
            }

            const newSummary = new WeeklySummary({
                summaryId: Date.now().toString(),
                userId: log.userId,
                characteristicId: log.characteristicId,
                weekStartDate: weekStart,
                weekEndDate: weekEnd,
                averageValue,
                totalValue,
                maxValue,
                primarySource: log.source
            });

            this.weeklySummaries.push(newSummary);
        }
    }

    async getAllSegmentSummaries(userId, segment, startDate, endDate, summaryType = 'daily') {
        const method = summaryType === 'daily' ? 'getDailySummaries' : 'getWeeklySummaries';
        return this[method](userId, segment, startDate, endDate);
    }
}

module.exports = HealthParameterService;