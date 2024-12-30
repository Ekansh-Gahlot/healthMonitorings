class ConfigurationService {
    static SEGMENT_THRESHOLDS = {
        ACTIVE_GYM_GOER: {
            HIGH: 0.8,
            MEDIUM: 0.5,
            LOW: 0.2
        },
        HYDRATION: {
            GOAL_PERCENTAGE: 0.8
        },
        SLEEP: {
            OPTIMAL_HOURS: 8,
            MINIMUM_HOURS: 6
        },
        TIME_WINDOWS: {
            MORNING_CUTOFF: '10:00',
            EVENING_START: '18:00'
        }
    };

    static NOTIFICATION_SETTINGS = {
        MAX_DAILY_NOTIFICATIONS: 5,
        QUIET_HOURS_START: '22:00',
        QUIET_HOURS_END: '07:00'
    };

    static getThreshold(segmentType, level) {
        return this.SEGMENT_THRESHOLDS[segmentType][level];
    }

    static isWithinQuietHours(time) {
        const timeStr = time.getHours().toString().padStart(2, '0') + ':' + 
                       time.getMinutes().toString().padStart(2, '0');
        const quietStart = this.NOTIFICATION_SETTINGS.QUIET_HOURS_START;
        const quietEnd = this.NOTIFICATION_SETTINGS.QUIET_HOURS_END;
        
        if (quietStart <= quietEnd) {
            return timeStr >= quietStart && timeStr < quietEnd;
        } else {
            // Handle overnight period (e.g., 22:00 to 07:00)
            return timeStr >= quietStart || timeStr < quietEnd;
        }
    }
}

module.exports = ConfigurationService; 