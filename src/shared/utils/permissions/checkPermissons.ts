import { User } from "@/models/user/user";

const userPermissions = {
  ADMIN: ["can:delete:user", "can:create:user", "can:update:user", "can:read:user", "can:delete:movie", "can:create:movie", "can:update:movie", "can:read:movie", "can:delete:genre", "can:create:genre", "can:update:genre", "can:read:genre", "can:delete:director", "can:create:director", "can:update:director", "can:read:director"],
  USER: ["can:read:user", "can:read:movie", "can:delete:hisAccount", "can:update:hisAccount"],
}
const checkPermissions = (user: User, action: string, resource: string) => {
  const permissions = userPermissions[user.role as keyof typeof userPermissions]
  if(!permissions) return false
  return permissions?.includes(`${action}:${resource}`);
};

export default checkPermissions;
