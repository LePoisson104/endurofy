export const getMySQLDateTimeUTC = (
  date = new Date()
): { date: string; time: string } => {
  const formatDate = `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

  const formatTime = `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  return { date: formatDate, time: formatTime };
};
