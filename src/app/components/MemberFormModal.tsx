// Shared Add/Edit member form, used from the Members list and the Member
// Profile page. Kept as one component so both flows stay consistent.
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "./Modal";
import { Btn, SelectField, TextField } from "./primitives";
import type { Member } from "../../domain/types";
import { membersService } from "../../services/membersService";

const roleOptions = ["Player", "Captain", "Coach", "Volunteer", "Parent", "Physio"];
const ageGroupOptions = ["Senior", "U18", "U16", "U14"];

export function MemberFormModal({
  open,
  onOpenChange,
  member,
  teams,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: Member;
  teams: string[];
  onSaved?: (member: Member) => void;
}) {
  const isEdit = !!member;
  const [name, setName] = useState(member?.name ?? "");
  const [team, setTeam] = useState(member?.team ?? teams[0] ?? "");
  const [role, setRole] = useState(member?.role ?? roleOptions[0]);
  const [ageGroup, setAgeGroup] = useState(member?.ageGroup ?? ageGroupOptions[0]);
  const [position, setPosition] = useState(member?.position ?? "");

  useEffect(() => {
    if (!open) return;
    setName(member?.name ?? "");
    setTeam(member?.team ?? teams[0] ?? "");
    setRole(member?.role ?? roleOptions[0]);
    setAgeGroup(member?.ageGroup ?? ageGroupOptions[0]);
    setPosition(member?.position ?? "");
  }, [open, member, teams]);

  const save = () => {
    if (!name.trim()) {
      toast.error("Enter a name before saving.");
      return;
    }
    if (isEdit && member) {
      membersService.updateMember(member.id, { name, team, role, ageGroup, position });
      toast.success(`${name} updated.`);
      onSaved?.({ ...member, name, team, role, ageGroup, position });
    } else {
      const created = membersService.addMember({ name, team, role, ageGroup, position });
      toast.success(`${name} added to ${team}.`);
      onSaved?.(created);
    }
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit member" : "Add member"}
      description={isEdit ? "Update this member's details." : "Add a mock member to the roster — frontend only, no production record is created."}
      footer={
        <>
          <Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn>
          <Btn onClick={save}>{isEdit ? "Save changes" : "Add member"}</Btn>
        </>
      }
    >
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Team" value={team} onChange={(e) => setTeam(e.target.value)}>
          {teams.map((t) => <option key={t} value={t}>{t}</option>)}
        </SelectField>
        <SelectField label="Age group" value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)}>
          {ageGroupOptions.map((a) => <option key={a} value={a}>{a}</option>)}
        </SelectField>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
          {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
        </SelectField>
        <TextField label="Position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Midfielder" />
      </div>
    </Modal>
  );
}
