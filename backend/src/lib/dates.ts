export function todayDateStringUtc(): string {
  return new Date().toISOString().slice(0, 10);
}


