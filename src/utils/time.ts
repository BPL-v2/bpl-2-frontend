export function getDeltaTimeBetween(to?: string, from?: string) {
  // If either timestamp or league
  if (!to || !from) {
    return "";
  }
  const ts = new Date(to).getTime();
  const fromDate = new Date(from).getTime();
  const milliseconds = ts - fromDate;
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) {
    return `${days}d : ${hours}h : ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h : ${minutes}m`;
  }
  return `${minutes}m`;
}
