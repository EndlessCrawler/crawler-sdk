// Tiny class-name joiner — joins truthy string args with a space.
// (No clsx/tailwind-merge dependency; this app's class usage is simple.)
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
