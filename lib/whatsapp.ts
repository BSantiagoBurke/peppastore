import { formatPrice } from "./format";

export type OrderLine = { name: string; size: string; quantity: number; unitPrice: number };

export type Order = {
  customerName?: string;
  lines: OrderLine[];
  deliveryZone: string;
  paymentMethod: string;
};

export function orderTotal(lines: OrderLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
}

export function buildOrderMessage(order: Order): string {
  const name = order.customerName?.trim();
  const greeting = name
    ? `Hola Peppa! Soy ${name}. Quiero hacer este pedido:`
    : "Hola Peppa! Quiero hacer este pedido:";
  const items = order.lines.map(
    (l) => `• ${l.quantity} x ${l.name} (talle ${l.size}) ${formatPrice(l.quantity * l.unitPrice)}`,
  );
  return [
    greeting,
    "",
    ...items,
    "",
    `Total: ${formatPrice(orderTotal(order.lines))} + envío`,
    `Entrega: ${order.deliveryZone}`,
    `Pago: ${order.paymentMethod}`,
  ].join("\n");
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
