export const enUSDate = (date: string) => {
  return new Date(date.split("T")[0] + "T06:00:00.000Z").toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
};
