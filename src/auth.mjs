import https from "https";
import fetch from "node-fetch";
import {BENTO_DEBUG, BENTO_AUTHZ_SERVICE_URL} from "./config.mjs";

const httpsAgent = new https.Agent({
    rejectUnauthorized: !BENTO_DEBUG,
});

export const checkAgainstAuthorizationService = async (token) => {
    if (!BENTO_AUTHZ_SERVICE_URL) {
        console.error("missing BENTO_AUTHZ_SERVICE_URL")
        return false;
    }

    try {
        const res = await fetch(`${BENTO_AUTHZ_SERVICE_URL}policy/evaluate_one`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                resource: {everything: true},
                // TODO: granular permissions + message filtering instead:
                permission: "view:private_portal",
            }),
            agent: httpsAgent,
        });

        if (!res.ok) {
            console.error(`Got error response from Bento authorization service: ${res.status} ${await res.text()}`);
            return false;
        }

        try {
            const resData = await res.json();
            return resData.result;
        } catch (e) {
            console.error(`Error parsing response from Bento authorization service: ${e.message}`);
            return false;
        }
    } catch (e) {
        console.error(`Error contacting the Bento authorization service: ${e.message}`);
        return false;
    }
}
