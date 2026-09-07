"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Checkbox } from "@/components/ui/forms";
import { TableWrap, Td, Th } from "@/components/ui/layout";
import { useOpsStore } from "@/stores/ops-store";

const modules = ["Products", "Orders", "Marketing", "Inventory", "Customers", "Settings"];
const actions = ["view", "create", "edit", "delete", "update", "cancel", "refund", "publish"];

export default function RolesPage() {
  const roles = useOpsStore((s) => s.roles);
  const toggle = useOpsStore((s) => s.togglePermission);
  return (
    <div>
      <PageHeader title="Roles & permissions" description="Who can see, change, refund, or publish. This matrix is the future RBAC surface." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Roles" }]} />
      <div className="grid gap-8">
        {roles.map((role) => (
          <section key={role.id}>
            <h2 className="font-display text-xl">{role.name}</h2>
            <p className="mb-3 text-sm text-muted-foreground">{role.description}</p>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Module</Th>
                  {actions.map((a) => <Th key={a}>{a}</Th>)}
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => (
                  <tr key={mod}>
                    <Td className="font-medium">{mod}</Td>
                    {actions.map((a) => (
                      <Td key={a}>
                        <Checkbox
                          checked={(role.permissions[mod] ?? []).includes(a as never)}
                          onCheckedChange={() => toggle(role.id, mod, a)}
                          aria-label={`${role.name} ${mod} ${a}`}
                        />
                      </Td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </section>
        ))}
      </div>
    </div>
  );
}
