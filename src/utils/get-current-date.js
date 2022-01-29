// Returns the current date in YYYY-MM-DD format
export default () => {
    const d = new Date();
    const dd = d.getDate();
    const dm = d.getMonth() + 1;
    return d.getFullYear() + "-" + (dm < 10 ? "0" : "") + dm + "-" + (dd < 10 ? "0" : "") + dd;
}