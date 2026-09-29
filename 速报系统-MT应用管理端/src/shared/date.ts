export const getTodayStr = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getFutureDateStr = (days: number, baseDate = new Date()) => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateDays = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
};

export const calculateRemainingDays = (endDate: string) => {
  if (!endDate) return 0;
  const today = new Date(getTodayStr()).getTime();
  const end = new Date(endDate).getTime();
  return Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)));
};

export const formatDateTime = (date = new Date()) =>
  date.toISOString().replace('T', ' ').substring(0, 19);
