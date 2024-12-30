class DateUtils {
    static getWeekStart(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        return d;
    }

    static getWeekEnd(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        d.setDate(d.getDate() + (6 - d.getDay()));
        return d;
    }

    static getWeekKey(date) {
        return this.getWeekStart(date).toISOString().split('T')[0];
    }

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
}

module.exports = DateUtils; 