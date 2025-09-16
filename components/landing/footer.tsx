"use client";

import Link from "next/link";
import Image from "next/image";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { Heart } from "lucide-react";

export default function Footer({
  scrollToSection,
}: {
  scrollToSection: (
    e: React.MouseEvent<HTMLAnchorElement>,
    section: string
  ) => void;
}) {
  const isDark = useGetCurrentTheme();

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <Link href="/" onClick={(e) => scrollToSection(e, "hero")}>
            <div className="flex items-center gap-2">
              <Image
                src={
                  isDark
                    ? "/images/endurofy_logo.png"
                    : "/images/endurofy_logo_dark.png"
                }
                alt="Endurofy Logo"
                width={24}
                height={24}
              />
              <span className="text-xl font-bold hover:text-primary">
                Endurofy
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="#features"
              onClick={(e) => scrollToSection(e, "features")}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, "how-it-works")}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              How it works
            </Link>
            <Link
              href="#faq"
              onClick={(e) => scrollToSection(e, "faq")}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              FAQ
            </Link>
            <Link
              href="mailto:endurofy@gmail.com"
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Contact Us
            </Link>
            <div className="flex gap-6">
              <Link
                href="/terms-of-service"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy-policy"
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with <Heart className="w-4 h-4 fill-gray-400 text-gray-400" />{" "}
            by{" "}
            <Link
              href="https://LePoisson.work"
              target="_blank"
              className="hover:underline"
            >
              LePoisson
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-10 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Endurofy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
