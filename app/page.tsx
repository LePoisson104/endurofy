"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NotepadText,
  Activity,
  Apple,
  Calendar,
  Component,
  Menu,
  Sparkle,
  FilePlus,
  ChartColumn,
  CalendarSync,
} from "lucide-react";
import { MotionAccordion } from "@/components/landing/motion-accordion";
import { LandingPageThemeToggle } from "@/components/buttons/landing-page-theme-toggle";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";
import { FeatureCard } from "@/components/landing/feature-card";
import { useRouter } from "next/navigation";
import Footer from "@/components/landing/footer";
import MobileNavigation from "@/components/landing/mobile-navigation";
import GradientText from "@/components/text/gradient-text";
import { MobileInstallInstructionsModal } from "@/components/modals/mobile-install-instructions-modal";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const navLinkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.4 + i * 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function Home() {
  const isDark = useGetCurrentTheme();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [headerBlur, setHeaderBlur] = useState(5); // Initial blur amount
  const [email, setEmail] = useState("");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const background = isHovering
    ? isDark
      ? "linear-gradient(to bottom left, oklch(80% 0.004 286.32), oklch(45% 0.016 285.938))"
      : "linear-gradient(to bottom left, oklch(75% 0.006 286.286), oklch(40% 0.017 285.786))"
    : isDark
    ? "linear-gradient(to bottom left, oklch(92% 0.004 286.32), oklch(55.2% 0.016 285.938))"
    : "linear-gradient(to bottom left, oklch(87.1% 0.006 286.286), oklch(44.2% 0.017 285.786))";

  useEffect(() => {
    // Set loading to false after a small delay to ensure isMobile is set
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Effect for handling scroll and adjusting header blur
  useEffect(() => {
    const handleScroll = () => {
      // Calculate blur based on scroll position (max 20px blur)
      const scrollPosition = window.scrollY;
      const maxBlur = 20;
      const initialBlur = 5;
      const blurIncreaseFactor = 0.05; // How quickly blur increases

      // Calculate new blur value based on scroll (minimum 5px, maximum 20px)
      const newBlur = Math.min(
        maxBlur,
        initialBlur + scrollPosition * blurIncreaseFactor
      );

      setHeaderBlur(newBlur);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // PWA Install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, buttonRef]);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    setIsMenuOpen(false);

    // Add a small delay to ensure menu animation completes before scrolling
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Get the header height to offset the scroll position
        const header = document.querySelector("header");
        const headerHeight = header ? header.offsetHeight : 0;

        // Check if viewport is mobile or desktop
        if (window.innerWidth >= 768) {
          // 768px is typically md breakpoint in Tailwind
          // For larger screens - center the section in the viewport
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const middle =
            absoluteElementTop -
            window.innerHeight / 2 +
            elementRect.height / 2;

          window.scrollTo({
            top: middle,
            behavior: "smooth",
          });
        } else {
          // For mobile - position below header
          const elementPosition =
            element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    }, 300); // 300ms matches the menu animation duration
  };

  const handleStartNow = () => {
    const seesionEmail = sessionStorage.getItem("getStartedEmail");
    if (email !== "") {
      sessionStorage.setItem("getStartedEmail", email);
    } else if (seesionEmail && email === "") {
      sessionStorage.removeItem("getStartedEmail");
    }
    router.push("/signup");
  };

  const handleInstallPWA = async () => {
    // On mobile, show instructions instead of PWA prompt
    if (isMobile) {
      setShowMobileInstructions(true);
      return;
    }

    // On desktop, use standard PWA prompt if available
    if (deferredPrompt) {
      deferredPrompt.prompt();
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const handleOpenApp = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col landing-page">
      {/* <div className="animated-mesh-gradient"></div> */}
      {/* Header moved into hero section */}
      <header
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-50 w-full supports-[backdrop-filter]:bg-transparent ${
          isMobile ? "standalone:fixed standalone:pt-14" : ""
        }`}
        style={{ backdropFilter: `blur(${headerBlur}px)` }}
      >
        <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
          <Link href="/" onClick={(e) => scrollToSection(e, "hero")}>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold hover:text-primary flex items-center gap-2">
                <Image
                  src={
                    !isDark
                      ? "/images/endurofy_logo_dark.png"
                      : "/images/endurofy_logo.png"
                  }
                  alt="Endurofy"
                  width={30}
                  height={30}
                />
                Endurofy
              </span>
            </div>
          </Link>
          {!isLoading && !isMobile && (
            <nav className="hidden md:flex gap-6 items-center justify-center">
              <motion.div
                custom={0}
                variants={navLinkVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href="#features"
                  onClick={(e) => scrollToSection(e, "features")}
                  className="text-sm font-medium hover:text-primary nav-link"
                >
                  Features
                </Link>
              </motion.div>
              <motion.div
                custom={1}
                variants={navLinkVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href="#how-it-works"
                  onClick={(e) => scrollToSection(e, "how-it-works")}
                  className="text-sm font-medium hover:text-primary nav-link"
                >
                  How it works
                </Link>
              </motion.div>
              <motion.div
                custom={3}
                variants={navLinkVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href="#faq"
                  onClick={(e) => scrollToSection(e, "faq")}
                  className="text-sm font-medium hover:text-primary nav-link"
                >
                  FAQ
                </Link>
              </motion.div>
            </nav>
          )}
          <div className="flex items-center gap-4">
            {!isLoading && (
              <motion.div
                custom={0}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
              >
                <LandingPageThemeToggle />
              </motion.div>
            )}
            {!isLoading && !isMobile && (
              <motion.div
                custom={1}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href="/login" className="hidden md:block">
                  <Button variant="outline" className="px-5 py-4">
                    Log in
                  </Button>
                </Link>
              </motion.div>
            )}
            {!isLoading && !isMobile && (
              <motion.div
                custom={2}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href="/signup">
                  <Button className="px-5 py-4 arrow-button ">
                    Try it now{" "}
                    <svg
                      className="arrow-icon"
                      viewBox="0 -3.5 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
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
              </motion.div>
            )}
            {isMobile && (
              <motion.div
                custom={1}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  ref={buttonRef}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </header>
      <div className="standalone:h-[70px]" />
      <main className="flex-1">
        {/* Hero Section with Header */}
        {/* Header inside hero section */}
        <motion.section
          id="hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-0 w-full py-12 md:py-24 lg:py-25 xl:pt-40 px-4 md:px-6"
        >
          <div className="container px-4 md:px-6 mx-auto mt-16">
            <div className="flex justify-center items-center">
              <div className="flex flex-col justify-center items-center space-y-4">
                <div className="space-y-2 text-center">
                  <h1
                    className={`text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none  ${
                      isMobile ? "mt-15" : ""
                    }`}
                  >
                    <GradientText>
                      Strengthen Your Endurance,
                      <br />
                      Enhance Your Life
                    </GradientText>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground mx-auto">
                    Endurofy makes it easy to track your endurance activities,
                    stay consistent, and achieve your fitness goals faster.
                  </p>
                </div>
                <div className="flex flex-col gap-4 items-center w-full max-w-md mx-auto">
                  <div className="relative w-full">
                    <Input
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-28 rounded-full py-5 bg-muted/50 text-muted-background placeholder:text-muted-foreground w-full"
                    />

                    <Button
                      size="sm"
                      className="arrow-button rounded-full px-3 py-1 h-7 bg-linear-to-bl from-zinc-400 to-zinc-800 dark:from-zinc-100 dark:to-zinc-500 text-primary-foreground absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={handleStartNow}
                    >
                      Start now
                      <svg
                        className="arrow-icon"
                        viewBox="0 -3.5 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
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
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Get set up in 5 minutes. No credit card required.
                    </p>
                  </div>
                  <Button
                    onClick={
                      isMobile || isInstallable
                        ? handleInstallPWA
                        : handleOpenApp
                    }
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    style={{
                      background,
                      padding: "1.5rem 2rem",
                      borderRadius: "0.375rem",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.25)",
                    }}
                    // className="bg-primary px-8 py-6 rounded-md bg-linear-to-bl from-zinc-300 to-zinc-600 dark:from-zinc-200 dark:to-zinc-500
                    //  hover:from-zinc-400 hover:to-zinc-700 dark:hover:from-zinc-300 dark:hover:to-zinc-600 shadow-neutral-500 shadow-lg dark:shadow-md"
                  >
                    <Image
                      src={
                        isDark
                          ? "/images/endurofy_logo_dark.png"
                          : "/images/endurofy_logo.png"
                      }
                      alt="Endurofy"
                      width={30}
                      height={30}
                    />
                    {isMobile || isInstallable ? "Install App" : "Open App"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="w-full mb-30"
        >
          <div className="container px-4 md:px-6 mx-auto flex justify-center items-center">
            <div className="border p-[2px] rounded-lg shadow-xl">
              <div className="relative overflow-hidden rounded-lg border transition-transform duration-300 max-w-7xl">
                <Image
                  src={
                    isDark
                      ? "/images/dark/desktop.png"
                      : "/images/light/desktop-light.png"
                  }
                  alt="Endurofy Desktop View"
                  width={1500}
                  height={1000}
                  className="object-contain w-full h-auto"
                  priority
                  quality={95}
                  unoptimized={false}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="w-full py-12 md:py-24 lg:py-32 relative"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="container px-4 md:px-6 mx-auto relative">
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <div className="shadow-lg shadow-muted-foreground inline-flex items-center gap-2 bg-linear-to-bl from-zinc-400 to-zinc-800 dark:from-zinc-100 dark:to-zinc-500 px-3 py-1 text-sm text-primary-foreground rounded-full">
                  <Sparkle className="h-3 w-3" />
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  <GradientText>
                    Everything you need to reach your peak
                  </GradientText>
                </h2>
                <p className="max-w-[900px] text-muted-foreground">
                  Endurofy combines powerful tracking and analytics features to
                  help you achieve your fitness goals.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3"
            >
              <FeatureCard
                icon={<Calendar className="h-6 w-6 text-red-400" />}
                title="Training Programs"
                bgColor="bg-red-400"
                description="Follow personalized training programs designed to help you reach your goals."
              />
              <FeatureCard
                icon={<CalendarSync className="h-6 w-6 text-pink-400" />}
                title="Auto-filled Workouts"
                bgColor="bg-pink-400"
                description="Endurofy pre-fills each day in your workout log with the exercises from your program."
              />
              <FeatureCard
                icon={<NotepadText className="h-6 w-6 text-purple-400" />}
                title="Advanced Tracking"
                bgColor="bg-purple-400"
                description="Track workouts, and daily weights with detailed metrics."
              />
              <FeatureCard
                icon={<Activity className="h-6 w-6 text-sky-400" />}
                title="Weight Log"
                bgColor="bg-sky-400"
                description="Log your daily weight and automatically track your calorie intake at the end of each day."
              />
              <FeatureCard
                icon={<Apple className="h-6 w-6 text-emerald-400" />}
                title="Food Log"
                bgColor="bg-emerald-400"
                description="Easily track your daily food intake with access to over 300,000 food items."
              />
              <FeatureCard
                icon={<Component className="h-6 w-6 text-teal-400" />}
                title="Unlock Superpowers"
                bgColor="bg-teal-400"
                description="Consolidate three core features into a single app to save time and reduce switching between apps."
              />
            </motion.div>
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section
          id="how-it-works"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="w-full py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="shadow-lg shadow-muted-foreground inline-flex items-center gap-2 bg-linear-to-bl from-zinc-400 to-zinc-800 dark:from-zinc-100 dark:to-zinc-500 px-3 py-1 text-sm text-primary-foreground rounded-full">
                  <Sparkle className="h-3 w-3" />
                  How it works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  <GradientText>Simple, intuitive, and effective</GradientText>
                </h2>
                <p className="max-w-[900px] text-muted-foreground">
                  Customize your training plans, track your progress, and reach
                  your goals.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-3">
              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="pulse pulse-1 bg-muted">
                  <FilePlus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">
                  Create Your Workout program
                </h3>
                <p className="text-muted-foreground text-[15px]">
                  Design your custom training plan with the flexibility to match
                  your goals, whether it&apos;s strength, endurance, or overall
                  fitness.
                </p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="pulse pulse-2 bg-muted">
                  <CalendarSync className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Auto-filled Workouts</h3>
                <p className="text-muted-foreground text-[15px]">
                  Stay focused &amp; Endurofy pre-fills each day in your workout
                  log with the exercises from your program, so all you need to
                  do is log your reps and weights.
                </p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="pulse pulse-3 bg-muted">
                  <ChartColumn className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Track and Progress</h3>
                <p className="text-muted-foreground text-[15px]">
                  Follow your plan, track your progress, and see your growth
                  over time with powerful insights and analytics.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* App Screenshots */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="w-full py-12 md:py-24 lg:py-32"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <div className="shadow-lg shadow-muted-foreground inline-flex items-center gap-2 bg-linear-to-bl from-zinc-400 to-zinc-800 dark:from-zinc-100 dark:to-zinc-500 px-3 py-1 text-sm text-primary-foreground rounded-full">
                  <Sparkle className="h-3 w-3" />
                  Intuitive interface
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  <GradientText>
                    Effortless Interactions, Powerful Experiences
                  </GradientText>
                </h2>
                <p className="max-w-[900px] text-muted-foreground">
                  Beautiful, intuitive interface that works for both desktop and
                  mobile devices.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              className="mx-auto grid max-w-6xl gap-6 py-12 md:grid-cols-4"
            >
              <motion.div
                variants={imageVariants}
                className="relative aspect-[9/20] overflow-hidden drop-shadow-xl w-full max-w-[300px] md:max-w-[500px] mx-auto border rounded-xl"
              >
                <Image
                  src={`${
                    isDark
                      ? "/images/dark/dashboard.png"
                      : "/images/light/dashboard-light.png"
                  }`}
                  alt="dashboard"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                variants={imageVariants}
                className="relative aspect-[9/20] overflow-hidden md:translate-y-10 rounded-xl bg-muted drop-shadow-xl border w-full max-w-[300px] md:max-w-[500px] mx-auto"
              >
                <Image
                  src={`${
                    isDark
                      ? "/images/dark/foodlog.png"
                      : "/images/light/foodlog-light.png"
                  }`}
                  alt="dashboard"
                  fill
                  className="object-cover"
                />
              </motion.div>
              <motion.div
                variants={imageVariants}
                className="relative aspect-[9/20] overflow-hidden rounded-xl md:translate-y-10 bg-muted drop-shadow-xl border w-full max-w-[300px] md:max-w-[500px] mx-auto"
              >
                <Image
                  src={
                    isDark
                      ? "/images/dark/workoutlog.png"
                      : "/images/light/workoutlog-light.png"
                  }
                  alt="workout-log"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <motion.div
                variants={imageVariants}
                className="relative aspect-[9/20] overflow-hidden rounded-xl bg-muted drop-shadow-xl border w-full max-w-[300px] md:max-w-[500px] mx-auto"
              >
                <Image
                  src={`${
                    isDark
                      ? "/images/dark/weightlog.png"
                      : "/images/light/weightlog-light.png"
                  }`}
                  alt="weightlog"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          id="faq"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="w-full py-12 md:py-24 lg:py-32 px-1"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="shadow-lg shadow-muted-foreground inline-flex items-center gap-2 bg-linear-to-bl from-zinc-400 to-zinc-800 dark:from-zinc-100 dark:to-zinc-500 px-3 py-1 text-sm text-primary-foreground rounded-full">
                  <Sparkle className="h-3 w-3" />
                  FAQ
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  <GradientText>Questions & Answers</GradientText>
                </h2>
                <p className="max-w-[900px] text-muted-foreground">
                  Everything you need to know about Endurofy.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <MotionAccordion />
            </div>
          </div>
        </motion.section>

        {/* Get Started */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="w-full py-12 md:py-24 lg:py-32 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:50.5px_52px]"
        >
          <div className="container grid items-center gap-6 px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  <GradientText>Get started with Endurofy</GradientText>
                </h2>
                <p className="max-w-[600px] text-muted-foreground text-sm mx-auto">
                  Built for driven athletes who want to turn consistent training
                  into real progress.
                </p>
              </div>

              <div
                className={`relative flex-1 ${isMobile ? "w-[90%]" : "w-md"}`}
              >
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-28 rounded-full py-5 bg-muted/50 text-muted-background placeholder:text-muted-foreground"
                />

                <Button
                  size="sm"
                  className="arrow-button rounded-full px-3 py-1 h-7 bg-linear-to-bl from-zinc-400 to-zinc-800 dark:from-zinc-100 dark:to-zinc-500 text-primary-foreground absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleStartNow}
                >
                  Start now
                  <svg
                    className="arrow-icon"
                    viewBox="0 -3.5 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
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
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer scrollToSection={scrollToSection} />

      {/* Mobile menu panel MOVED HERE, as a sibling to header, main, and footer */}
      {isMobile && (
        <MobileNavigation
          isMenuOpen={isMenuOpen}
          menuRef={menuRef}
          toggleMenu={toggleMenu}
          scrollToSection={scrollToSection}
        />
      )}

      {/* Mobile Install Instructions Modal */}
      <MobileInstallInstructionsModal
        isOpen={showMobileInstructions}
        onClose={() => setShowMobileInstructions(false)}
      />
    </div>
  );
}
