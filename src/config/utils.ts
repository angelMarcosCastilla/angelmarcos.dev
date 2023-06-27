export function getTheme () : string {
  return localStorage.getItem('theme') ?? 'light'
}