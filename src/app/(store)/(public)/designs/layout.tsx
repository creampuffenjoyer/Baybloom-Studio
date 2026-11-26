import { BackToBaybloom } from "@/components/layout/back-to-baybloom";

export default function DesignsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="container-page pt-4"><BackToBaybloom /></div>
      {children}
    </>
  );
}
