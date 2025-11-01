export const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

export const formatTimeInput = (numbers: string): string => {
  // Pad with leading zeros to always have at least 4 digits for display
  const padded = numbers.padStart(4, "0");
  // Format as MM:SS
  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}`;
};
