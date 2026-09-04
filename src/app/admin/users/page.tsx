"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms";
import { TableWrap, Td, Th } from "@/components/ui/layout";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/overlay";
import { formatDateTime } from "@/lib/format";
import { useOpsStore } from "@/stores/ops-store";

export default function UsersPage() {
  const staff = useOpsStore((s) => s.staff);
  const roles = useOpsStore((s) => s.roles);
  const save = useOpsStore((s) => s.saveStaff);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("role_support");

  return (
    <div>
      <PageHeader title="Users & staff" description="Who can sit at this desk." crumbs={[{ href: "/admin", label: "Dashboard" }, { label: "Staff" }]} actions={<Button onClick={() => setOpen(true)}>Invite</Button>} />
      <TableWrap>
        <thead><tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Last active</Th></tr></thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id}>
              <Td className="font-medium">{s.name}</Td>
              <Td>{s.email}</Td>
              <Td>{roles.find((r) => r.id === s.roleId)?.name}</Td>
              <Td><StatusBadge value={s.status} /></Td>
              <Td className="text-muted-foreground">{s.lastActive ? formatDateTime(s.lastActive) : "—"}</Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle className="font-display text-xl">Invite staff</DialogTitle>
          <div className="mt-4 grid gap-3">
            <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Role">
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Button onClick={async () => {
              await save({ id: `st_${Date.now()}`, name, email, roleId, status: "invited", lastActive: "" });
              toast.success("Invite sent (simulated)");
              setOpen(false);
            }}>Send invite</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
