import fetch from "node-fetch";
import {BENTO_AUTHZ_SERVICE_URL} from "./config.mjs";

export const checkAgainstAuthorizationService = async (token) => {
    if (!BENTO_AUTHZ_SERVICE_URL) return false;

    const res = await fetch(BENTO_AUTHZ_SERVICE_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            requested_resource: {everything: true},
            required_permissions: ["view:private_portal"],  // TODO: granular permissions + message filtering instead.
        }),
    });

    if (!res.ok) {
        console.error(`Got error response from Bento authorization service: ${res.status} ${await res.text()}`);
        return false;
    }

    try {
        const resData = await res.json();
        return resData.result;
    } catch (e) {
        console.error(`Error parsing response from Bento authorization service: ${e}`);
        return false;
    }
}
