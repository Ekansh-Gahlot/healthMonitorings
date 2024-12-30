const DateUtils = require('../utils/DateUtils');

class DataRetentionService {
    static async processDailyRetention() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7);

        await this.moveToWeeklySummary(cutoffDate);
        await this.cleanupOldDailyLogs(cutoffDate);
    }

    static async moveToWeeklySummary(cutoffDate) {
        const oldLogs = await this.getLogsBeforeCutoff(cutoffDate);
        const groupedLogs = this.groupLogsByWeek(oldLogs);

        for (const [weekKey, logs] of Object.entries(groupedLogs)) {
            const [weekStart, weekEnd] = this.getWeekDates(weekKey);
            
            await WeeklySummary.create({
                userId: logs[0].userId,
                characteristicId: logs[0].characteristicId,
                weekStartDate: weekStart,
                weekEndDate: weekEnd,
                averageValue: this.calculateAverage(logs),
                totalValue: this.calculateTotal(logs),
                maxValue: this.calculateMax(logs),
                primarySource: this.determinePrimarySource(logs)
            });
        }
    }

    static async getLogsBeforeCutoff(cutoffDate) {
        return await DailySummary.find({
            date: { $lt: cutoffDate }
        });
    }
    
    static async cleanupOldDailyLogs(cutoffDate) {
        await DailySummary.deleteMany({
            date: { $lt: cutoffDate }
        });
    }

    static groupLogsByWeek(logs) {
        return logs.reduce((groups, log) => {
            const weekKey = DateUtils.getWeekKey(log.date);
            if (!groups[weekKey]) {
                groups[weekKey] = [];
            }
            groups[weekKey].push(log);
            return groups;
        }, {});
    }

    static calculateAverage(logs) {
        return logs.reduce((sum, log) => sum + log.value, 0) / logs.length;
    }

    static calculateTotal(logs) {
        return logs.reduce((sum, log) => sum + log.value, 0);
    }

    static calculateMax(logs) {
        return Math.max(...logs.map(log => log.value));
    }

    static determinePrimarySource(logs) {
        // Count occurrences of each source
        const sourceCounts = logs.reduce((counts, log) => {
            counts[log.source] = (counts[log.source] || 0) + 1;
            return counts;
        }, {});

        // Find the source with the highest count
        return Object.entries(sourceCounts)
            .sort(([, a], [, b]) => b - a)[0][0];
    }
}

module.exports = DataRetentionService; 