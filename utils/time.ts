export { getTimeZone };

/**
 * Get the current time zone
 */
function getTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
