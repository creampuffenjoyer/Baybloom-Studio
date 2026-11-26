import { MemberEditor } from "@/components/member-editor";

export default function EditorLayout({children}: {children: React.ReactNode}) {
  return <MemberEditor slug="still-water-spa">{children}</MemberEditor>;
}
