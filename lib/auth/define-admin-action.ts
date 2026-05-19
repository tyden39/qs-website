import { db } from "@/lib/db/client";
import { requireRole, type AdminRole } from "./require";

type Session = Awaited<ReturnType<typeof requireRole>>;
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Wrap every admin Server Action so authorization + transactional boundary are
// guaranteed. Streams MUST use this instead of inline session checks — any
// audit log writes inside the handler atomically commit with the action.
export function defineAdminAction<Args extends unknown[], Result>(
  roles: AdminRole[],
  handler: (ctx: { session: Session; tx: Tx }, ...args: Args) => Promise<Result>,
) {
  return async (...args: Args): Promise<Result> => {
    const session = await requireRole(roles);
    return db.transaction(async (tx) => handler({ session, tx }, ...args));
  };
}
