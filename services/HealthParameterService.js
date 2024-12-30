const Characteristic = require('../models/Characteristic');
const CharacteristicLog = require('../models/CharacteristicLog');
const DailySummary = require('../models/DailySummary');
const WeeklySummary = require('../models/WeeklySummary');

class HealthParameterService {
    constructor() {
        this.characteristics = new Map();
        this.characteristicLogs = [];
        this.weeklySummaries = [];
        this.dailySummaries = [];
    }

    addCharacteristic(characteristic) {
        this.characteristics.set(characteristic.characteristicId, characteristic);
    }

    getCharacteristic(characteristicId) {
        return this.characteristics.get(characteristicId);
    }

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
        const weekStart = this.getWeekStart(log.referenceDay);
        const weekEnd = this.getWeekEnd(log.referenceDay);

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

    getWeekStart(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        return d;
    }

    getWeekEnd(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        d.setDate(d.getDate() + (6 - d.getDay()));
        return d;
    }

    getDailySummaries(userId, characteristicId, startDate, endDate) {
        return this.dailySummaries.filter(
            summary =>
                summary.userId === userId &&
                summary.characteristicId === characteristicId &&
                summary.date >= startDate &&
                summary.date <= endDate
        );
    }

    getWeeklySummaries(userId, characteristicId, startDate, endDate) {
        return this.weeklySummaries.filter(
            summary =>
                summary.userId === userId &&
                summary.characteristicId === characteristicId &&
                summary.weekStartDate >= startDate &&
                summary.weekEndDate <= endDate
        );
    }
}

module.exports = HealthParameterService;