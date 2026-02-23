export type Role = "admin" | "manager" | "staff" | "housekeeping";

export type ModuleKey =
    | "dashboard"
    | "checkin"
    | "guests"
    | "rooms"
    | "archivedGuests"
    | "housekeeping"
    | "settings";

export type ActionKey =
    | "view"
    | "create"
    | "edit"
    | "delete"
    | "export"
    | "restore"
    | "manageUsers";

type ModulePerms = { view: boolean } & Partial<Record<ActionKey, boolean>>;
export type RolePerms = Record<ModuleKey, ModulePerms>;

export const ROLE_PERMS: Record<Role, RolePerms> = {
    admin: {
        dashboard: { view: true },
        checkin: { view: true, create: true, edit: true },
        guests: { view: true, create: true, edit: true, delete: true, export: true },
        rooms: { view: true, create: true, edit: true, delete: true },
        archivedGuests: { view: true, restore: true, delete: true },
        housekeeping: { view: true, edit: true },
        settings: { view: true, edit: true, manageUsers: true },
    },

    manager: {
        dashboard: { view: true },
        checkin: { view: true, create: true, edit: true },
        guests: { view: true, create: true, edit: true, export: true },
        rooms: { view: true, edit: true },
        archivedGuests: { view: true, restore: true },
        housekeeping: { view: true, edit: true },
        settings: { view: true },
    },

    staff: {
        dashboard: { view: true },
        checkin: { view: true, create: true, edit: true },
        guests: { view: true, create: true, edit: true },
        rooms: { view: true, edit: true },
        archivedGuests: { view: true },
        housekeeping: { view: true },
        settings: { view: false },
    },

    housekeeping: {
        dashboard: { view: true },
        checkin: { view: false },
        guests: { view: false },
        rooms: { view: true },
        archivedGuests: { view: false },
        housekeeping: { view: true, edit: true },
        settings: { view: false },
    },
};

export const canAccess = (role: Role | null | undefined, module: ModuleKey): boolean => {
    if(!role) return false;
    return ROLE_PERMS[role]?.[module]?.view === true;
};

export const canPerform = (
    role: Role | null | undefined,
    module: ModuleKey,
    action: ActionKey
): boolean => {
    if(!role) return false;
    const perms = ROLE_PERMS[role][module];
    if (!perms.view) return false;
    return perms[action] === true;
};