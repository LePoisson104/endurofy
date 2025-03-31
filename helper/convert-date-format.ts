export const convertDateFormat = (isoString: string) => {
  const date = new Date(isoString);
  const formattedDate = date.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Replace only the second comma with " |"
  return formattedDate.replace(/,([^,]*)$/, " |$1");
};
