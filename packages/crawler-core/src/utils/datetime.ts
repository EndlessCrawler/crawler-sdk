/**
 * @param t Unix timestamp (seconds since Unix epoch)
 * @returns formatted string representing the date/time
 */
export const formatTimestamp = (t: number): string => {
	const timeUTC = new Date(t * 1000).getTime()
	const tzoffset = (new Date(0)).getTimezoneOffset() * 60000 // local timezone offset in milliseconds
	const localDate = new Date(timeUTC - tzoffset)
	const iso = localDate.toISOString()
	const [date, iso2] = iso.split('T')
	const [time, iso3] = iso2.split('.')
	const [hour, minutes, seconds] = time.split(':')
	return `${date} ${hour}:${minutes}`
}

/**
 * @param end Unix timestamp (seconds since Unix epoch)
 * @returns formatted string of date/time remaining from current time to end
 */
export const formatTimestampCountdown = (end: number): string => {
	const now = Math.floor(new Date().getTime() / 1000)
	return formatTimestampDelta(now, end)
}

/**
 * @param start Unix timestamp (seconds since Unix epoch)
 * @param end Unix timestamp (seconds since Unix epoch)
 * @returns formatted string of date/time remaining from start to end
 */
export const formatTimestampDelta = (start: number, end: number): string => {
	const t = Math.max(0, end - start)
	const iso = (new Date(t * 1000).toISOString())
	const [date, iso2] = iso.split('T')
	const [time, iso3] = iso2.split('.')
	const [hour, minutes, seconds] = time.split(':')
	const days = Math.floor(t / (24 * 60 * 60))
	let result = ''
	if (days > 0) result += `${days}d `
	if (days > 0 || parseInt(hour) > 0) result += `${hour == '00' ? '0' : hour}h `
	return result + `${minutes}m ${seconds}s`
}
