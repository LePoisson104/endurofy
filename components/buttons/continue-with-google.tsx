import Image from "next/image";
import { Button } from "../ui/button";

export default function ContinueWithGoogle() {
  return (
    <Button variant="outline" className="w-full gap-3">
      <Image src="/icons/googleIcon.svg" alt="Google" width={15} height={15} />
      Continue with Google
    </Button>
  );
}
