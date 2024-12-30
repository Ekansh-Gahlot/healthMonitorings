const HealthParameterService = require('./HealthParameterService');
const healthParameterService = new HealthParameterService();
const DateUtils = require('../utils/DateUtils');

class AnalyticsService {
    static SEGMENTS = {
        FITNESS: 'fitness',
        NUTRITION: 'nutrition',
        SLEEP: 'sleep',
        MOTIVATION: 'motivation',
        BEHAVIORAL: 'behavioral'
    };

    static async calculateUserSegments(userId, timeframe = '7d') {
        const segments = {
            fitness: await this.calculateFitnessSegments(userId, timeframe),
            nutrition: await this.calculateNutritionSegments(userId, timeframe),
            sleep: await this.calculateSleepSegments(userId, timeframe),
            motivation: await this.calculateMotivationSegments(userId, timeframe),
            behavioral: await this.calculateBehavioralSegments(userId, timeframe)
        };

        return segments;
    }

    static async getSummariesForPeriod(userId, timeframe) {
        const endDate = new Date();
        const startDate = DateUtils.calculateStartDate(timeframe);

        if (timeframe === '7d') {
            return await healthParameterService.getAllSegmentSummaries(userId, startDate, endDate, 'daily');
        }
        return await healthParameterService.getAllSegmentSummaries(userId, startDate, endDate, 'weekly');
    }

    static async calculateFitnessSegments(userId, timeframe) {
        const summaries = await this.getSummariesForPeriod(userId, timeframe);
        
        return {
            activeGymGoer: this.calculateGymGoerScore(summaries),
            highIntensityUser: this.calculateIntensityScore(summaries),
            stepChampion: this.calculateStepScore(summaries)
        };
    }

    static async calculateNutritionSegments(userId, timeframe) {
        const summaries = await this.getSummariesForPeriod(userId, timeframe);
        
        return {
            hydrationConsciousUser: this.calculateHydrationScore(summaries),
            proteinTracker: this.calculateProteinScore(summaries),
            calorieTracker: this.calculateCalorieScore(summaries)
        };
    }

    static async calculateSleepSegments(userId, timeframe) {
        const summaries = await this.getSummariesForPeriod(userId, timeframe);
        
        return {
            avgSleepScore: this.calculateAverageSleep(summaries),
            sleepConsistency: this.calculateSleepConsistency(summaries)
        };
    }

    static async calculateMotivationSegments(userId, timeframe) {
        const summaries = await this.getSummariesForPeriod(userId, timeframe);
        
        return {
            goalOriented: this.calculateGoalAchievement(summaries),
            rewardMotivated: this.calculateRewardEngagement(summaries),
            selfImprovement: this.calculateContentEngagement(summaries)
        };
    }

    static async calculateBehavioralSegments(userId, timeframe) {
        const summaries = await this.getSummariesForPeriod(userId, timeframe);
        
        return {
            morningRoutineUser: this.calculateMorningRoutine(summaries),
            eveningRoutineUser: this.calculateEveningRoutine(summaries),
            manualLogger: this.calculateManualLogging(summaries),
            automatedTracker: this.calculateAutomatedTracking(summaries)
        };
    }

    // Scoring Methods
    static calculateGymGoerScore(summaries) {
        const workouts = summaries.filter(s => s.characteristicId === 'GYM_WORKOUT');
        const workoutsPerWeek = (workouts.length / (summaries.length / 7));
        
        if (workoutsPerWeek >= 4) return 1.0;
        if (workoutsPerWeek >= 3) return 0.8;
        if (workoutsPerWeek >= 2) return 0.5;
        return 0.2;
    }

    static calculateHydrationScore(summaries) {
        const hydrationEntries = summaries.filter(s => s.characteristicId === 'WATER_INTAKE');
        const goalAchievement = hydrationEntries.filter(e => e.totalValue >= e.goalValue).length;
        return goalAchievement / hydrationEntries.length;
    }

    static calculateMorningRoutine(summaries) {
        const morningEntries = summaries.filter(s => {
            const entryHour = new Date(s.timestamp).getHours();
            return entryHour < 10;
        });
        return morningEntries.length / summaries.length > 0.7;
    }

    static calculateEveningRoutine(summaries) {
        const eveningEntries = summaries.filter(s => {
            const entryHour = new Date(s.timestamp).getHours();
            return entryHour >= 18 && entryHour < 22; // 6 PM to 10 PM
        });
        return eveningEntries.length / summaries.length > 0.7;
    }

    static calculateManualLogging(summaries) {
        const manualEntries = summaries.filter(s => s.entryType === 'MANUAL');
        const manualRatio = manualEntries.length / summaries.length;
        
        // User is considered a manual logger if more than 60% of their entries are manual
        return manualRatio > 0.6;
    }

    static calculateAutomatedTracking(summaries) {
        const automatedEntries = summaries.filter(s => s.entryType === 'AUTOMATED');
        const automatedRatio = automatedEntries.length / summaries.length;
        
        // User is considered an automated tracker if more than 60% of their entries are automated
        return automatedRatio > 0.6;
    }

    // Helper Methods
    static calculateStartDate(timeframe) {
        const now = new Date();
        switch (timeframe) {
            case '7d':
                return new Date(now.setDate(now.getDate() - 7));
            case '30d':
                return new Date(now.setDate(now.getDate() - 30));
            case '90d':
                return new Date(now.setDate(now.getDate() - 90));
            default:
                throw new Error(`Invalid timeframe: ${timeframe}`);
        }
    }

    async getDailySummaries(userId, startDate, endDate) {
        const allSummaries = [];
        for (const segment of Object.values(AnalyticsService.SEGMENTS)) {
            const summaries = healthParameterService.getDailySummaries(
                userId,
                segment,
                startDate,
                endDate
            );
            allSummaries.push(...summaries);
        }
        return allSummaries;
    }

    async getWeeklySummaries(userId, startDate, endDate) {
        const allSummaries = [];
        for (const segment of Object.values(AnalyticsService.SEGMENTS)) {
            const summaries = healthParameterService.getWeeklySummaries(
                userId,
                segment,
                startDate,
                endDate
            );
            allSummaries.push(...summaries);
        }
        return allSummaries;
    }
}

module.exports = AnalyticsService; 