import { describe, expect, it } from "vitest";

import { AuthError, saveSamlMetadata } from "./auth";

describe("AuthError", () => {
  it("sets the code field on construction", () => {
    const err = new AuthError("saml_metadata_invalid", "bad xml");
    expect(err.code).toBe("saml_metadata_invalid");
    expect(err.message).toBe("bad xml");
    expect(err.name).toBe("AuthError");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AuthError);
  });

  it("defaults the message to the code when none is provided", () => {
    const err = new AuthError("saml_metadata_invalid");
    expect(err.code).toBe("saml_metadata_invalid");
    expect(err.message).toBe("saml_metadata_invalid");
  });

  it("is thrown by saveSamlMetadata with a structured code", async () => {
    await expect(
      saveSamlMetadata({ workspaceId: "ws_1", xml: "not-xml" }),
    ).rejects.toMatchObject({
      name: "AuthError",
      code: "saml_metadata_invalid",
    });
  });
});
