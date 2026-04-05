const AUTH_ERROR_MESSAGES: Array<[pattern: RegExp, message: string]> = [
  [/email rate limit exceeded/i, "Cok fazla e-posta denemesi yapildi. Lutfen biraz bekleyip tekrar dene."],
  [/invalid login credentials/i, "E-posta veya sifre hatali. Bilgilerini kontrol edip tekrar dene."],
  [/email not confirmed/i, "E-posta dogrulamasi gerekiyor. Gerekliyse mail kutunu kontrol et."],
  [/user already registered/i, "Bu e-posta adresi zaten kayitli. Dogrudan giris yapabilirsin."]
];

export const getAuthStatusMessage = (message: string) => {
  const match = AUTH_ERROR_MESSAGES.find(([pattern]) => pattern.test(message));
  return match?.[1] ?? message;
};
