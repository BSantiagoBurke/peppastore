import { describe, expect, it } from "vitest";
import { slugify, SLUG_PATTERN } from "./slug";

describe("slugify", () => {
  it("saca acentos, eñes y símbolos", () => {
    expect(slugify("Vestido Lumière Nº 2")).toBe("vestido-lumiere-n-2");
    expect(slugify("  Pollera  Año Nuevo!! ")).toBe("pollera-ano-nuevo");
    expect(slugify("BTF")).toBe("btf");
  });
  it("genera slugs válidos", () => {
    for (const s of ["Top Ámbar", "Body — encaje", "Shine 2.0"]) expect(slugify(s)).toMatch(SLUG_PATTERN);
  });
});
