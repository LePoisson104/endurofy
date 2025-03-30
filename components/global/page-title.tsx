import React from "react";

interface pageTitleProps {
  title: string;
  subTitle: string;
}

export default function PageTitle({ title, subTitle }: pageTitleProps) {
  return (
    <div className="flex flex-col">
      <div className="text-2xl font-bold">{title}</div>
      <p className="text-sm text-muted-foreground">{subTitle}</p>
    </div>
  );
}
