const WAS_URL = "http://localhost:8000";

export async function call(api, method, request) {
    let header;
    let body;
    let options;

    header = new Headers({
        "Content-Type": "application/json",
        "Corss-origin-Opener-Policy": "unsafe-none",
    });
    body = request ? JSON.stringify(request) : null;

    if (method === "GET") {
        options = {
            headers: header,
            url: WAS_URL + api,
            method: method,
            credentials: 'include',
        };
    } else {
        options = {
            headers: header,
            url: WAS_URL + api,
            method: method,
            credentials: 'include',
            body: body
        };
    }

    return fetch(options.url, options)
        .then((response) =>
            (response.json())
        )
        .catch((error) => {
            console.log(error.status);
        });
}