import { describe, expect, it } from "vitest";

import { AuthError, authError } from "./auth";

describe("AuthError", () => {
  it("sets the code field and is a proper Error subclass", () => {
    const error = new AuthError("saml_issuer_invalid");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("saml_issuer_invalid");
    expect(error.name).toBe("AuthError");
    expect(error.message).toBe("saml_issuer_invalid");
  });

  it("accepts a custom message", () => {
    const error = new AuthError("password_invalid", "wrong password");
    expect(error.code).toBe("password_invalid");
    expect(error.message).toBe("wrong password");
  });

  it("authError factory returns an AuthError with the given code", () => {
    const error = authError("magic_token_expired");
    expect(error).toBeInstanceOf(AuthError);
    expect(error.code).toBe("magic_token_expired");
  });
});
