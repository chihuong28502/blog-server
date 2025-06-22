export const generatePassword = (length = 8) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters[randomIndex];
  }
  return password;
}

export function extractOrderId(orderCode: string): string | null {
  const parts = orderCode.split("-");
  if (parts.length < 2) return null;

  const idAndMethod = parts[1]; // "${id}_${paymentMethod}"
  const id = idAndMethod.split("_")[0]; // chỉ lấy phần id
  return id;
}