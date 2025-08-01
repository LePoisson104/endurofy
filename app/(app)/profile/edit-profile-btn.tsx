"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface EditProfileBtnProps {
  onEdit: () => void;
}

export default function EditProfileBtn({ onEdit }: EditProfileBtnProps) {
  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
      <Edit className="h-4 w-4" />
      Edit Profile
    </Button>
  );
}
