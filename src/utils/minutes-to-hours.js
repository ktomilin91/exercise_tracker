// Converts minutes into a string like 3h 15m
export default m => {
    const hours = Math.floor(m / 60);
    const minutes = m - (hours * 60);
    return hours + "h " + minutes + "m";
}
