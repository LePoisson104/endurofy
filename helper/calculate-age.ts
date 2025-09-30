import { parseDateSafely } from "./parse-date-safely";

export function calculateAge(birthDateString: string) {
  const birthDate = parseDateSafely(birthDateString);
  if (!birthDate) return 0;

  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}
