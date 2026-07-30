function createScheduleTimeOptions() {
  const options: string[] = [];

  for (let hour = 8; hour <= 18; hour += 1) {
    for (let minute = 0; minute < 60; minute += 5) {
      if (hour === 18 && minute > 0) {
        break;
      }

      options.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
      );
    }
  }

  return options;
}

export const scheduleTimeOptions = createScheduleTimeOptions();
