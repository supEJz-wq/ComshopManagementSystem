// Shared PCs test values. Each test gets the same fresh disposable database.
const pcNames = [
    'PCS-FREE-01', 'PCS-FREE-010', 'PCS-RENTED-01', 'PCS-ISSUE-IDLE',
    'PCS-ISSUE-RENTED', 'PCS-UNRESPONSIVE-IDLE', 'PCS-UNRESPONSIVE-RENTED',
    'PCS-CAP-RENTED', 'PCS-FREE-REPAIR', 'PCS-RENTED-REPAIR',
];

const presets = [
    {label: '30 min', seconds: 1800}, {label: '1 hr', seconds: 3600},
    {label: '2 hr', seconds: 7200}, {label: '3 hr', seconds: 10800},
    {label: '5 hr', seconds: 18000}, {label: '6 hr', seconds: 21600},
];

// nativePart identifies invalid input rejected by the browser's min/max/step rules.
// Other cases must produce the application's visible duration validation message.
const invalidDurations = [
    {label: 'blank duration', value: {}, error: 'Enter a duration of at least 1 minute.'},
    {label: 'all-zero duration', value: {hours: 0, minutes: 0, seconds: 0}, error: 'Enter a duration of at least 1 minute.'},
    {label: '59 seconds', value: {seconds: 59}, error: 'Enter a duration of at least 1 minute.'},
    {label: 'negative hours', value: {hours: -1}, nativePart: 'hours'},
    {label: 'fractional minutes', value: {minutes: 1.5}, nativePart: 'minutes'},
    {label: '60 minutes in the minutes field', value: {minutes: 60}, nativePart: 'minutes'},
    {label: '60 seconds in the seconds field', value: {seconds: 60}, nativePart: 'seconds'},
    {label: '24 hours plus one second', value: {hours: 24, seconds: 1}, error: 'A rental cannot be longer than 24 hours.'},
];

/** Convert displayed m:ss / h:mm:ss into seconds for bounded countdown comparisons. */
function clockSeconds(text) {
    return text.trim().split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

module.exports = {pcNames, presets, invalidDurations, clockSeconds};
