// Converts minutes into HH:MM format
export default m => {
    const hours = Math.floor(m / 60);
    const minutes = m - (hours * 60);
    return hours + "h " + minutes + "m";
}