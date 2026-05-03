import PublicFooter from "@/components/shared/PublicFooter";
import PublicNavbar from "@/components/shared/PublicNavbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PublicNavbar></PublicNavbar>
      <div>{children}</div>
      <PublicFooter></PublicFooter>
    </>
  );
};

export default CommonLayout;
