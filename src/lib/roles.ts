export const ROLES = {
  SUPPORT_DIGITAL: "SUPPORT_DIGITAL",
  SERVICE_MANAGER: "SERVICE_MANAGER",
  ADMIN: "ADMIN",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const roleOptions: { value: AppRole; label: string }[] = [
  { value: ROLES.SUPPORT_DIGITAL, label: "Support Digital" },
  { value: ROLES.SERVICE_MANAGER, label: "Service Manager" },
  { value: ROLES.ADMIN, label: "Admin" },
];

export function getRoleLabel(role?: string | null) {
  return roleOptions.find((item) => item.value === role)?.label || "Unknown";
}

export function canWrite(role?: string | null) {
  return role === ROLES.SUPPORT_DIGITAL;
}
