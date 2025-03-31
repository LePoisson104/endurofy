export const convertDateFormat = (isoString: string) => {
  const date = new Date(isoString);
  return date
    .toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " |"); // Replace comma to match your format
};
