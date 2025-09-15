export const minutesToHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 9 ? mins : `${'0'}${mins}min`}`;
};
