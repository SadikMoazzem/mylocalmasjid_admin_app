export function formatTime(timeStr: string | null | undefined, use24Hour: boolean) {
  if (!timeStr) return '-';
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24Hour
  });
}

export function getMonthDates(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0]
  };
}

export function formatHijriDate(dateStr: string) {
  const [day, month, year] = dateStr.split(' ');
  return `${day} ${month}`;
}

export function getDaysInMonth(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  
  return Array.from({ length: lastDay }, (_, i) => {
    const day = new Date(year, month, i + 1);
    return day.toISOString().split('T')[0];
  });
}

export function isToday(dateStr: string) {
  const today = new Date();
  const date = new Date(dateStr);
  return date.toDateString() === today.toDateString();
} 