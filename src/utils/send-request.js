// Sends an AJAX request
export default (params, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener("load", () => callback(null, xhr.response));
    xhr.addEventListener("error", err => callback(err, null));
    xhr.open(params.mode, params.url);
    if(params.body) xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params.body || null);
}