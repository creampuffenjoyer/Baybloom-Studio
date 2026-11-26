import { MemberEditor } from "@/components/member-editor";

export default function EditorLayout({children}: {children: React.ReactNode}) {
  return <MemberEditor slug="bloomfield-gardens">{children}</MemberEditor>;
}
