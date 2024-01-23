
/** @returns true if running on a client (browser) */
//@ts-ignore
export const isBrowser = () => (typeof window !== 'undefined')

/** @returns true if running headless (node) */
//@ts-ignore
export const isNode = () => (typeof global !== 'undefined')

