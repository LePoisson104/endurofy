export const convertDateFormat = (isoString: string, withTime = false) => {
  const date = new Date(isoString + "T00:00:00");
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
