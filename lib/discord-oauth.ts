import * as oauth from "oauth4webapi";

export function validateDiscordCallback(server: oauth.AuthorizationServer, client: oauth.Client, request: Pick<Request, "url">, state: string) {
  // NextURL is not a native URL, which oauth4webapi requires at runtime.
  return oauth.validateAuthResponse(server, client, new URL(request.url), state);
}

export const loginErrors: Record<string, string> = {
  setup: "Вход пока не подключён.",
  cookie: "Не найден сеанс входа. Начните вход заново на основном адресе сайта и разрешите cookies.",
  callback: "Ответ Discord не прошёл проверку. Начните вход заново, не используя старую ссылку.",
  expired: "Попытка входа истекла или уже использована. Нажмите «Войти через Discord» ещё раз.",
  token: "Не удалось подтвердить вход через Discord. Администратору нужно проверить Client ID, Client Secret и Redirect URI.",
  profile: "Не удалось получить профиль Discord. Попробуйте войти позднее.",
  database: "Не удалось сохранить сеанс входа. Администратору нужно проверить подключение к базе.",
  denied: "Вы отменили вход через Discord.",
};
