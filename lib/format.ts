const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** 58900 -> "$58.900" (sin espacio entre el signo y el número). */
export function formatPrice(pesos: number): string {
  return priceFormatter.format(pesos).replace(/\s/g, "");
}

/** "5493816680549" -> "+54 381 668-0549". Si no reconoce el formato, devuelve "+<dígitos>". */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  const m = d.match(/^549(\d{3})(\d{3})(\d{4})$/);
  return m ? `+54 ${m[1]} ${m[2]}-${m[3]}` : `+${d}`;
}

/** "Lunes a sábado · 10 a 13 h · 17 a 22 h" -> ["Lunes a sábado", "10 a 13 h · 17 a 22 h"] */
export function splitHours(hours: string): [string, string | null] {
  const i = hours.indexOf(" · ");
  return i === -1 ? [hours, null] : [hours.slice(0, i), hours.slice(i + 3)];
}

/** ["Transferencia", "Efectivo"] -> "Transferencia o efectivo." */
export function joinPaymentMethods(methods: string[]): string {
  if (methods.length === 0) return "";
  const [first, ...rest] = methods.map((m, i) => (i === 0 ? m : m.toLowerCase()));
  if (rest.length === 0) return `${first}.`;
  const last = rest.pop();
  return `${[first, ...rest].join(", ")} o ${last}.`;
}
