const WAS_URL = process.env.REACT_APP_WAS_ADDRESS;

export async function call(api, method, request) {
    let header;
    let body;
    let options;

    const authorization = get_cookie("Authorization");

    header = new Headers({
        "Content-Type": "application/json",
        "Corss-origin-Opener-Policy": "unsafe-none",
        "Authorization": authorization,
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
            response.json().then((json) => {
                if (json.resultcode === undefined) {
                    return { resultcode: "FAIL" };
                }
                return json;
            }))
        .catch((error) => {
            console.log(error);
            return { resultcode: "FAIL" };
        });
}

export function get_cookie(name) {
    var value = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return value ? value[2] : null;
}