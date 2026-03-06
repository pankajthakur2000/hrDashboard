export function todayDateStringUtc() {
    return new Date().toISOString().slice(0, 10);
}
