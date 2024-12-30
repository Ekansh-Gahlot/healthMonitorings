const cron = require('node-cron');
const { DataRetentionService, AnalyticsService, NotificationService, UserService } = require('../services');

// Daily data retention processing (midnight)
cron.schedule('0 0 * * *', async () => {
    try {
        await DataRetentionService.processDailyRetention();
        console.log('Daily retention processing completed');
    } catch (error) {
        console.error('Error in daily retention processing:', error);
    }
});

// Weekly segment recalculation (Sunday midnight)
cron.schedule('0 0 * * 0', async () => {
    try {
        const users = await UserService.getAllActiveUsers();
        for (const user of users) {
            await AnalyticsService.calculateUserSegments(user.id);
        }
        console.log('Weekly segment recalculation completed');
    } catch (error) {
        console.error('Error in weekly segment recalculation:', error);
    }
});

// Daily notification check (8 AM)
cron.schedule('0 8 * * *', async () => {
    try {
        const users = await UserService.getAllActiveUsers();
        for (const user of users) {
            await NotificationService.checkAndTriggerNotifications(user.id);
        }
        console.log('Daily notifications processed');
    } catch (error) {
        console.error('Error in notification processing:', error);
    }
}); 