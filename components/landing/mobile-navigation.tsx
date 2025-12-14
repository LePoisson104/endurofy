import { Button } from "../ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";

interface MobileNavigationProps {
  isMenuOpen: boolean;
  menuRef: any;
  toggleMenu: () => void;
  scrollToSection: (
    e: React.MouseEvent<HTMLAnchorElement>,
    section: string
  ) => void;
}

const menuVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
    transition: { type: "linear", duration: 0.25, ease: "easeInOut" },
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "linear", duration: 0.25, ease: "easeInOut" },
  },
};

export default function MobileNavigation({
  isMenuOpen,
  menuRef,
  toggleMenu,
  scrollToSection,
}: MobileNavigationProps) {
  return (
    <motion.div
      className="fixed top-0 right-0 bottom-0 z-50 w-full  bg-background p-4 shadow-xl flex flex-col backdrop-filter backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 overflow-y-auto"
      initial="hidden"
      animate={isMenuOpen ? "visible" : "hidden"}
      variants={menuVariants}
      ref={menuRef}
    >
      {/* Close button inside the panel */}
      <div className="flex justify-start w-full mb-10 standalone:pt-14 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          aria-label="Close menu"
          className="h-10 w-10"
        >
          <X className="h-15 w-15" />
        </Button>
      </div>
      {/* Original navigation content */}
      <nav className="flex flex-col px-5 justify-between h-full">
        <div className="flex flex-col gap-4">
          <Link
            href="#features"
            onClick={(e) => scrollToSection(e, "features")}
            className="text-lg font-medium hover:text-primary py-1.5"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, "how-it-works")}
            className="text-lg font-medium hover:text-primary py-1.5"
          >
            How it works
          </Link>
          <Link
            href="#pricing"
            onClick={(e) => scrollToSection(e, "pricing")}
            className="text-lg font-medium hover:text-primary py-1.5"
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            onClick={(e) => scrollToSection(e, "faq")}
            className="text-lg font-medium hover:text-primary py-1.5"
          >
            FAQ
          </Link>
        </div>
        <div className="flex flex-col gap-2 pt-1 pb-1 mb-10">
          <Link href="/login" className="flex-1">
            <Button variant="outline" className="w-full h-9">
              Log in
            </Button>
          </Link>
          <Link href="/signup" className="flex-1">
            <Button className="w-full h-9 arrow-button">
              Try it now
              <svg
                className="arrow-icon"
                viewBox="0 -3.5 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="7"
                height="7"
              >
                <path
                  className="arrow-icon__tip"
                  d="M8 15L14 8.5L8 2"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <line
                  className="arrow-icon__line"
                  x1="13"
                  y1="8.5"
                  y2="8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </Button>
          </Link>
        </div>
      </nav>
    </motion.div>
  );
}
