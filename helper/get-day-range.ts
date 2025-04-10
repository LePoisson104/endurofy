import { subDays } from "date-fns";

export const getDayRange = ({ options }: { options: string }) => {
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (options === "7d") {
    startDate = subDays(new Date(), 7);
    endDate = new Date();
  }
  if (options === "30d") {
    startDate = subDays(new Date(), 30);
    endDate = new Date();
  }
  if (options === "90d") {
    startDate = subDays(new Date(), 90);
    endDate = new Date();
  }

  return { startDate, endDate };
};
