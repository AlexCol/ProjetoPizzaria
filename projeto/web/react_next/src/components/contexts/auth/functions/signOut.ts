import api from "@/services/api";

export default async function signOut() {
  try {
    await api({
      method: 'post',
      url: '/auth/logout'
    });
  } catch { /*do nothing*/ }
}
