export const expandEvent = (
  event: any,
  startDate?: Date,
  endDate?: Date,
) => {
  if (!event.is_recurring) {
    const evtStart = new Date(event.start_date);
    if (startDate && evtStart < startDate) return [];
    if (endDate && evtStart > endDate) return [];
    return [event];
  }

  const instances: any[] = [];
  const start = new Date(event.start_date);

  const MAX_YEARS = 5;
  const hardLimitDate = new Date(start);
  hardLimitDate.setFullYear(hardLimitDate.getFullYear() + MAX_YEARS);

  const recurEnd = event.end_recurrence_date
    ? new Date(event.end_recurrence_date)
    : hardLimitDate;

  let loopEnd = recurEnd;
  if (endDate && endDate < loopEnd) loopEnd = endDate;
  if (hardLimitDate < loopEnd) loopEnd = hardLimitDate;

  loopEnd.setHours(23, 59, 59, 999);

  const currentDate = new Date(start);
  currentDate.setHours(0, 0, 0, 0);

  const targetCount = event.end_recurrence_count || Infinity;
  let matchesFound = 0;

  while (currentDate.getTime() <= loopEnd.getTime()) {
    if (matchesFound >= targetCount) break;

    let isMatch = false;
    const dayName = currentDate.toLocaleDateString("en-US", {
      weekday: "short",
    });

    if (event.repeat_days && event.repeat_days.includes(dayName)) {
      if (event.repeat_pattern === "Weekly") {
        isMatch = true;
      } else if (event.repeat_pattern === "Every_Two_Weeks") {
        const diffTime = Math.abs(currentDate.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weekNum = Math.floor(diffDays / 7);
        if (weekNum % 2 === 0) isMatch = true;
      }
    }

    if (isMatch) {
        matchesFound++;
        let inWindow = true;

        const instanceDate = new Date(currentDate);
        const originalStart = new Date(event.start_date);
        instanceDate.setHours(originalStart.getHours(), originalStart.getMinutes(), originalStart.getSeconds());

        if (startDate && instanceDate < startDate) inWindow = false;
        if (inWindow) {
            instances.push({
                ...event,
                start_date: instanceDate,
            });
        }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return instances;
};
