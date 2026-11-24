import { describe, expect, it } from "vitest";
import { matchLocale } from "./config";
import en from "./messages/en.json";
import ptBR from "./messages/pt-BR.json";

/** Lists every key path of a nested messages object ("taskList.title", …). */
function keyPaths(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === "object" && child !== null ? keyPaths(child, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

/** ICU placeholders used by a message ("{title}", "{total, plural, …}" → "title", "total"). */
function placeholders(message: string) {
  return [...message.matchAll(/\{(\w+)/g)].map((match) => match[1]).sort();
}

describe("translations", () => {
  it("pt-BR has exactly the same keys as en (nothing missing or left over)", () => {
    expect(keyPaths(ptBR).sort()).toEqual(keyPaths(en).sort());
  });

  it("each pt-BR message uses the same placeholders as its English version", () => {
    const get = (messages: object, path: string) =>
      path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], messages) as string;

    for (const path of keyPaths(en)) {
      expect(placeholders(get(ptBR, path)), path).toEqual(placeholders(get(en, path)));
    }
  });
});

describe("matchLocale (browser language on the first visit)", () => {
  it.each([
    ["pt-BR,pt;q=0.9,en;q=0.8", "pt-BR"],
    ["pt-PT", "pt-BR"],
    ["en-US,en;q=0.9", "en"],
    ["fr-FR,pt;q=0.5,en;q=0.4", "pt-BR"],
    ["en;q=0.5,pt-BR;q=0.9", "pt-BR"],
    ["de-DE", "en"],
    ["", "en"],
    [null, "en"],
  ])("%s → %s", (header, expected) => {
    expect(matchLocale(header)).toBe(expected);
  });
});
