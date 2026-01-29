
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isToday(dateStr: string): boolean {
  if (!dateStr) return false;
  const taskDate = dateStr.split('T')[0];
  const today = getLocalDateString();
  return taskDate === today;
}

export function isTomorrow(dateStr: string): boolean {
  if (!dateStr) return false;
  const taskDate = dateStr.split('T')[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = getLocalDateString(tomorrowDate);
  return taskDate === tomorrow;
}

export function isPast(dateStr: string): boolean {
  if (!dateStr) return false;
  const taskDate = dateStr.split('T')[0];
  const today = getLocalDateString();
  return taskDate < today;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "Sem data";
  const parts = dateStr.split('T')[0].split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  
  const today = getLocalDateString();
  const taskDate = dateStr.split('T')[0];
  
  if (taskDate === today) return "Hoje";
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  if (taskDate === getLocalDateString(tomorrowDate)) return "Amanhã";

  return d.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short' 
  });
}

export function formatFullDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split('T')[0].split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  
  return d.toLocaleDateString('pt-BR', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
}
