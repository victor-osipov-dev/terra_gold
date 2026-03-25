import { ROLE_LABELS } from "../consts/member"

export const getRoleLabel = (role: string) => {
  return ROLE_LABELS[role] || 'Неизвестно'
}