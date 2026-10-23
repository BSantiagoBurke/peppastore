import { describe, expect, it } from "vitest";
import { formatPhone, formatPrice, joinPaymentMethods, splitHours } from "./format";

describe("formatPrice", () => {
  it("formatea pesos sin decimales con punto de miles", () => {
    expect(formatPrice(58900)).toBe("$58.900");
    expect(formatPrice(114500)).toBe("$114.500");
    expect(formatPrice(900)).toBe("$900");
    expect(formatPrice(0)).toBe("$0");
  });
});

describe("formatPhone", () => {
  it("formatea un celular de Tucumán", () => {
    expect(formatPhone("5493816680549")).toBe("+54 381 668-0549");
  });
  it("devuelve los dígitos si no reconoce el formato", () => {
    expect(formatPhone("+1 555 0100")).toBe("+15550100");
  });
});

describe("splitHours", () => {
  it("separa días y horarios", () => {
    expect(splitHours("Lunes a sábado · 10 a 13 h · 17 a 22 h")).toEqual(["Lunes a sábado", "10 a 13 h · 17 a 22 h"]);
    expect(splitHours("Todos los días")).toEqual(["Todos los días", null]);
  });
});

describe("joinPaymentMethods", () => {
  it("arma la frase de medios de pago", () => {
    expect(joinPaymentMethods(["Transferencia", "Efectivo"])).toBe("Transferencia o efectivo.");
    expect(joinPaymentMethods(["Transferencia", "Efectivo", "Mercado Pago"])).toBe(
      "Transferencia, efectivo o mercado pago.",
    );
    expect(joinPaymentMethods(["Efectivo"])).toBe("Efectivo.");
  });
});
