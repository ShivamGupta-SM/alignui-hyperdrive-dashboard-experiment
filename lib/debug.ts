export function logDebug(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[DEBUG ${timestamp}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}
