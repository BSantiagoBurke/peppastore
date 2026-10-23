import { describe, expect, it } from "vitest";
import { buildOrderMessage, buildWhatsAppUrl } from "./whatsapp";

const lines = [
  { name: "Vestido Lumière", size: "S", quantity: 1, unitPrice: 58900 },
  { name: "Top Duna", size: "M", quantity: 2, unitPrice: 27800 },
];

describe("buildOrderMessage", () => {
  it("coincide con el formato exacto de la sección 2.2", () => {
    expect(
      buildOrderMessage({ customerName: "Sofi", lines, deliveryZone: "San Miguel de Tucumán", paymentMethod: "Transferencia" }),
    ).toBe(
      [
        "Hola Peppa! Soy Sofi. Quiero hacer este pedido:",
        "",
        "• 1 x Vestido Lumière (talle S) $58.900",
        "• 2 x Top Duna (talle M) $55.600",
        "",
        "Total: $114.500 + envío",
        "Entrega: San Miguel de Tucumán",
        "Pago: Transferencia",
      ].join("\n"),
    );
  });

  it("omite 'Soy {nombre}.' si no hay nombre", () => {
    const msg = buildOrderMessage({ customerName: "   ", lines, deliveryZone: "Yerba Buena", paymentMethod: "Efectivo" });
    expect(msg.startsWith("Hola Peppa! Quiero hacer este pedido:\n")).toBe(true);
  });
});

describe("buildWhatsAppUrl", () => {
  it("usa el número de la configuración y codifica el texto", () => {
    expect(buildWhatsAppUrl("+54 9 381 668-0549", "Hola Peppa!\n• 1")).toBe(
      "https://wa.me/5493816680549?text=Hola%20Peppa!%0A%E2%80%A2%201",
    );
  });
});
