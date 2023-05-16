import * as jose from "jose";
import {OPENID_TOKEN_AUDIENCE} from "./config.mjs";

export const verifyToken = async (token, issuer, jwksUri) => {
    const JWKS = jose.createRemoteJWKSet(new URL(jwksUri));

    const {payload, protectedHeader} = await jose.jwtVerify(token, JWKS, {
        issuer,
        audience: OPENID_TOKEN_AUDIENCE,
    });
    return {payload, protectedHeader};
};
