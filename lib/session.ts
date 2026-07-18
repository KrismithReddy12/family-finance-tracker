import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "session";
const ALG = "HS256";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type SessionPayload = {
  familyId: string;
  activeProfileId: string | null;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ familyId: payload.familyId, activeProfileId: payload.activeProfileId })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecretKey());
}

export async function readSessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.familyId !== "string") return null;
    return {
      familyId: payload.familyId,
      activeProfileId: typeof payload.activeProfileId === "string" ? payload.activeProfileId : null,
    };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_MAX_AGE = MAX_AGE_SECONDS;
