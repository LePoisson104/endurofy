export const convertDateFormat = (isoString: string, withTime = false) => {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    ...(withTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  });

  if (!withTime) {
    return formattedDate;
  }

  // Replace only the second comma with " |"
  return formattedDate.replace(/,([^,]*)$/, " |$1");
};

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
