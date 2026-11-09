// Validaciones de datos sensibles. Se ejecutan SIEMPRE en el servidor.

// Cédula ecuatoriana: 10 dígitos, provincia 01-24, tercer dígito < 6, dígito verificador (módulo 10)
export function cedulaValida(c) {
  if (!/^\d{10}$/.test(c)) return false;
  if (+c.slice(0, 2) < 1 || +c.slice(0, 2) > 24 || +c[2] > 5) return false;
  const suma = [...c.slice(0, 9)].reduce((acc, d, i) => {
    let v = +d * (i % 2 === 0 ? 2 : 1);
    if (v > 9) v -= 9;
    return acc + v;
  }, 0);
  return (10 - (suma % 10)) % 10 === +c[9];
}

export const placaValida = (p) => /^[A-Z]{3}-\d{3,4}$/.test(p);
export const passwordValida = (p) => typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
