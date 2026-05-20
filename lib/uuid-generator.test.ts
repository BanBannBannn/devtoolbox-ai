import { describe, expect, it } from "vitest";
import { generateUuidV4List } from "./uuid-generator";

const uuidV4Pattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const uppercaseUuidV4Pattern =
  /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/;

describe("generateUuidV4List", () => {
  it("generates one UUID v4", () => {
    const uuids = generateUuidV4List(1, false);

    expect(uuids).toHaveLength(1);
    expect(uuids[0]).toMatch(uuidV4Pattern);
  });

  it("generates multiple UUIDs", () => {
    const uuids = generateUuidV4List(3, false);

    expect(uuids).toHaveLength(3);
    uuids.forEach((uuid) => {
      expect(uuid).toMatch(uuidV4Pattern);
    });
  });

  it("uppercase option works", () => {
    const uuids = generateUuidV4List(1, true);

    expect(uuids).toHaveLength(1);
    expect(uuids[0]).toMatch(uppercaseUuidV4Pattern);
  });

  it("count below min falls back to 1", () => {
    const uuids = generateUuidV4List(0, false);

    expect(uuids).toHaveLength(1);
    expect(uuids[0]).toMatch(uuidV4Pattern);
  });

  it("count above max caps at 100", () => {
    const uuids = generateUuidV4List(101, false);

    expect(uuids).toHaveLength(100);
    uuids.forEach((uuid) => {
      expect(uuid).toMatch(uuidV4Pattern);
    });
  });
});
