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
  CalendarSync,
  Zap,
  Dumbbell,
  Scale,
  Utensils,
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
      ? "linear-gradient(135deg, rgb(212, 212, 216), rgb(161, 161, 170))"
      : "linear-gradient(135deg, rgb(161, 161, 170), rgb(113, 113, 122))"
    : isDark
    ? "linear-gradient(135deg, rgb(228, 228, 231), rgb(212, 212, 216))"
    : "linear-gradient(135deg, rgb(212, 212, 216), rgb(161, 161, 170))";

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
                  href="#integrations"
                  onClick={(e) => scrollToSection(e, "integrations")}
                  className="text-sm font-medium hover:text-primary nav-link"
                >
                  Integrations
                </Link>
              </motion.div>
              <motion.div
                custom={2}
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
        <motion.section
          id="hero"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="relative z-0 w-full py-12 md:py-24 lg:py-32 xl:py-40 px-4 md:px-6 overflow-hidden"
        >
          <div className="container px-4 md:px-6 mx-auto mt-16 relative">
            <div className="flex justify-center items-center">
              <div className="flex flex-col justify-center items-center space-y-8 max-w-5xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/15 via-sky-500/15 to-blue-500/15 dark:from-blue-500/10 dark:via-sky-500/10 dark:to-blue-500/10 border border-blue-500/40 dark:border-blue-500/30 relative overflow-hidden group"
                >
                  {/* Animated shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                    }}
                  />
                  <Sparkle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent relative z-10">
                    Your Complete Fitness Companion
                  </span>
                </motion.div>

                <div className="space-y-6 text-center">
                  <h1
                    className={`text-4xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl/none bg-clip-text ${
                      isMobile ? "mt-4" : ""
                    }`}
                  >
                    <GradientText>
                      Strengthen Your Endurance
                      <br />
                      Enhance Your Life
                    </GradientText>
                  </h1>
                  <p className="max-w-[700px] text-sm md:text-lg text-muted-foreground mx-auto leading-relaxed">
                    An all-in-one fitness platform combining workout tracking,
                    weight and nutrition logging to help you perform at your
                    best.
                  </p>
                </div>

                <div className="flex flex-col gap-6 items-center w-full max-w-md mx-auto">
                  <div className="relative w-full group">
                    <div className="absolute -inset-1 bg-zinc-500/30 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300" />
                    <Input
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="relative pr-32 rounded-full py-6 bg-background border-2 border-muted hover:border-primary/50 transition-colors w-full text-base"
                    />
                    <Button
                      size="sm"
                      className="arrow-button rounded-full px-4 py-2 h-9 bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-200 dark:hover:bg-zinc-100 dark:text-zinc-900 text-white absolute right-2 top-1/2 -translate-y-1/2 shadow-lg"
                      onClick={handleStartNow}
                    >
                      Start Free
                      <svg
                        className="arrow-icon ml-1"
                        viewBox="0 -3.5 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={
                        isMobile || isInstallable
                          ? handleInstallPWA
                          : handleOpenApp
                      }
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                      size="lg"
                      className="px-8 py-6 rounded-xl text-base font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
                      style={{
                        background,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Image
                        src={
                          isDark
                            ? "/images/endurofy_logo_dark.png"
                            : "/images/endurofy_logo.png"
                        }
                        alt="Endurofy"
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      {isMobile || isInstallable ? "Install App" : "Open App"}
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Desktop Showcase */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="w-full py-16 md:py-24"
        >
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              variants={imageVariants}
              className="relative mx-auto max-w-7xl"
            >
              <div className="absolute -inset-4 bg-zinc-500/20 rounded-2xl blur-2xl" />
              <div className="relative p-2 rounded-2xl bg-zinc-500/10 backdrop-blur-sm">
                <div className="relative overflow-hidden rounded-xl border-2 border-border/50 shadow-2xl hover:shadow-zinc-500/20 transition-all duration-500 group">
                  <div className="absolute inset-0 bg-zinc-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Image
                    src={
                      isDark
                        ? "/images/dark/desktop.png"
                        : "/images/light/desktop-light.png"
                    }
                    alt="Endurofy Desktop View"
                    width={1500}
                    height={1000}
                    className="object-contain w-full h-auto relative z-10"
                    priority
                    quality={95}
                    unoptimized={false}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="w-full pt-20 md:py-24 lg:py-32 relative"
        >
          <div className="hidden md:block absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="container px-4 md:px-6 mx-auto relative">
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center justify-center space-y-4 text-center"
            >
              <div className="space-y-2">
                <div className="shadow-lg shadow-zinc-500/20 inline-flex items-center gap-2 bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 px-4 py-2 text-sm text-white rounded-full font-medium">
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
                icon={<CalendarSync className="h-6 w-6 text-orange-400" />}
                title="Auto-filled Workouts"
                bgColor="bg-orange-400"
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

        {/* Integrations */}
        <motion.section
          id="integrations"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="w-full h-150"
        >
          <div className="container mx-auto h-full">
            <div className="flex flex-col items-center justify-center space-y-4 text-center pt-35">
              <div className="space-y-2">
                <div className="shadow-lg shadow-zinc-500/20 inline-flex items-center gap-2 bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 px-4 py-2 text-sm text-white rounded-full font-medium">
                  <Sparkle className="h-3 w-3" />
                  Integrations
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  <GradientText>
                    Three Essential Features, One Unified Platform
                  </GradientText>
                </h2>
                <p className="max-w-[900px] text-muted-foreground">
                  Seamlessly integrate your workouts, nutrition, and weight
                  tracking in one place. All your fitness data flows together to
                  give you the complete picture of your progress.
                </p>
              </div>
              <div className="relative w-full max-w-xl mx-auto pb-32 md:pb-40">
                <div className="relative w-full aspect-square max-h-96">
                  {/* SVG Dashed Lines and Animated Dots */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{ overflow: "visible" }}
                  >
                    {/* Line from Top Left (Workout) to Center */}
                    <motion.line
                      x1="15"
                      y1="10"
                      x2="50"
                      y2="50"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                      className="text-primary/30 dark:text-primary/40"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />

                    {/* Line from Top Right (Food) to Center */}
                    <motion.line
                      x1="85"
                      y1="10"
                      x2="50"
                      y2="50"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                      className="text-primary/30 dark:text-primary/40"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />

                    {/* Line from Bottom Center (Weight) to Center */}
                    <motion.line
                      x1="50"
                      y1="110"
                      x2="50"
                      y2="50"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      strokeDasharray="2 2"
                      className="text-primary/30 dark:text-primary/40"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </svg>

                  {/* Animated Dots using divs */}
                  {/* Top Left Line (Workout) - Dot 1 */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-primary dark:bg-primary/80 -translate-x-1/2 -translate-y-1/2"
                    initial={{ left: "15%", top: "10%", opacity: 0 }}
                    animate={{
                      left: ["15%", "50%"],
                      top: ["10%", "50%"],
                      opacity: [1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 1.8,
                      times: [0, 0.5, 0.9, 1],
                    }}
                  />
                  {/* Top Left Line (Workout) - Dot 2 */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-primary dark:bg-primary/80 -translate-x-1/2 -translate-y-1/2"
                    initial={{ left: "15%", top: "10%", opacity: 0 }}
                    animate={{
                      left: ["15%", "50%"],
                      top: ["10%", "50%"],
                      opacity: [1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 3.2,
                      times: [0, 0.5, 0.9, 1],
                    }}
                  />

                  {/* Top Right Line (Food) - Dot 1 */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-primary dark:bg-primary/80 -translate-x-1/2 -translate-y-1/2"
                    initial={{ left: "85%", top: "10%", opacity: 0 }}
                    animate={{
                      left: ["85%", "50%"],
                      top: ["10%", "50%"],
                      opacity: [1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 2.3,
                      times: [0, 0.5, 0.9, 1],
                    }}
                  />
                  {/* Top Right Line (Food) - Dot 2 */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-primary dark:bg-primary/80 -translate-x-1/2 -translate-y-1/2"
                    initial={{ left: "85%", top: "10%", opacity: 0 }}
                    animate={{
                      left: ["85%", "50%"],
                      top: ["10%", "50%"],
                      opacity: [1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 3.7,
                      times: [0, 0.5, 0.9, 1],
                    }}
                  />

                  {/* Bottom Line (Weight) - Dot 1 */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-primary dark:bg-primary/80 -translate-x-1/2 -translate-y-1/2"
                    initial={{ left: "50%", top: "110%", opacity: 0 }}
                    animate={{
                      left: "50%",
                      top: ["110%", "50%"],
                      opacity: [1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 2.8,
                      times: [0, 0.5, 0.9, 1],
                    }}
                  />
                  {/* Bottom Line (Weight) - Dot 2 */}
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-primary dark:bg-primary/80 -translate-x-1/2 -translate-y-1/2"
                    initial={{ left: "50%", top: "110%", opacity: 0 }}
                    animate={{
                      left: "50%",
                      top: ["110%", "50%"],
                      opacity: [1, 1, 1, 0],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 4.2,
                      times: [0, 0.5, 0.9, 1],
                    }}
                  />

                  {/* Central Logo - Centered at (50, 50) */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                  >
                    <div className="relative">
                      <div className="absolute -inset-4 bg-primary/20 dark:bg-primary/30 rounded-2xl blur-2xl" />
                      <div className="bg-primary dark:bg-primary rounded-md p-1">
                        <Image
                          src={
                            isDark
                              ? "/images/endurofy_logo_dark.png"
                              : "/images/endurofy_logo.png"
                          }
                          alt="Endurofy"
                          width={60}
                          height={60}
                          className="relative z-10"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Feature Icons */}
                  {/* Workout Icon - Top Left - Aligned with line at (15, 10) */}
                  <motion.div
                    initial={{ opacity: 0, x: -30, y: -30 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="absolute top-[10%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-10"
                  >
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-muted rounded-full blur-xl opacity-50 group-hover:opacity-75 transition duration-300" />
                      <div className="relative rounded-full p-4 shadow-2xl border border-primary/30 bg-background">
                        <Dumbbell className="h-6 w-6 text-primary dark:text-primary/80" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Food Icon - Top Right - Aligned with line at (85, 10) */}
                  <motion.div
                    initial={{ opacity: 0, x: 30, y: -30 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="absolute top-[10%] left-[85%] -translate-x-1/2 -translate-y-1/2 z-10"
                  >
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-muted rounded-full blur-xl opacity-50 group-hover:opacity-75 transition duration-300" />
                      <div className="relative rounded-full p-4 shadow-2xl border border-primary/30 bg-background">
                        <Utensils className="h-6 w-6 text-primary dark:text-primary/80" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Weight Icon - Bottom Center - Aligned with line at (50, 100) */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="absolute top-[110%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
                  >
                    <div className="relative group">
                      <div className="absolute -inset-2 bg-muted rounded-full blur-xl opacity-50 group-hover:opacity-75 transition duration-300" />
                      <div className="relative rounded-full p-4 shadow-2xl border border-primary/30 bg-background">
                        <Scale className="h-6 w-6 text-primary dark:text-primary/80" />
                      </div>
                    </div>
                  </motion.div>
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
          className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background via-muted/20 to-background mt-50"
        >
          <div
            className={`container px-4 md:px-6 mx-auto ${
              isMobile ? "mt-30" : ""
            }`}
          >
            <motion.div
              variants={fadeInUp}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <div className="space-y-4">
                <div className="shadow-lg shadow-zinc-500/20 inline-flex items-center gap-2 bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 px-4 py-2 text-sm text-white rounded-full font-medium">
                  <Sparkle className="h-3 w-3" />
                  Beautifully Designed
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-5xl">
                  <GradientText>
                    Designed for You,
                    <br />
                    Simple and Effortless to Use
                  </GradientText>
                </h2>
                <p className="max-w-[700px] text-lg text-muted-foreground mx-auto">
                  Experience a seamless, intuitive interface designed to make
                  tracking your fitness journey effortless.
                </p>
              </div>
            </motion.div>

            {/* Equal Grid Layout */}
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Dashboard */}
                <motion.div
                  variants={imageVariants}
                  className="relative group -my-20 md:my-0"
                >
                  <div className="absolute -inset-1 bg-zinc-500/30 dark:bg-zinc-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300 scale-75 md:scale-100" />
                  <div className="relative aspect-[9/19.5] overflow-hidden rounded-2xl shadow-2xl bg-background scale-75 md:scale-100 transition-transform">
                    <Image
                      src={
                        isDark
                          ? "/images/dark/dashboard.png"
                          : "/images/light/dashboard-light.png"
                      }
                      alt="Dashboard"
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                {/* Workout Log */}
                <motion.div
                  variants={imageVariants}
                  className="relative group -my-20 md:my-0"
                >
                  <div className="absolute -inset-1 bg-zinc-500/30 dark:bg-zinc-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300 md:translate-y-10 scale-75 md:scale-100 transition-transform" />
                  <div className="relative aspect-[9/19.5] overflow-hidden rounded-2xl shadow-2xl bg-background md:translate-y-10 scale-75 md:scale-100 transition-transform">
                    <Image
                      src={
                        isDark
                          ? "/images/dark/workoutlog.png"
                          : "/images/light/workoutlog-light.png"
                      }
                      alt="Workout Log"
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                {/* Food Log */}
                <motion.div
                  variants={imageVariants}
                  className="relative group -my-20 md:my-0"
                >
                  <div className="absolute -inset-1 bg-zinc-500/30 dark:bg-zinc-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300 md:translate-y-10 scale-75 md:scale-100 transition-transform" />
                  <div className="relative aspect-[9/19.5] overflow-hidden rounded-2xl shadow-2xl bg-background md:translate-y-10 scale-75 md:scale-100 transition-transform">
                    <Image
                      src={
                        isDark
                          ? "/images/dark/foodlog.png"
                          : "/images/light/foodlog-light.png"
                      }
                      alt="Food Log"
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
                {/* Weight Log */}
                <motion.div
                  variants={imageVariants}
                  className="relative group -my-20 md:my-0"
                >
                  <div className="absolute -inset-1 bg-zinc-500/30 dark:bg-zinc-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300 scale-75 md:scale-100 transition-transform" />
                  <div className="relative aspect-[9/19.5] overflow-hidden rounded-2xl shadow-2xl bg-background scale-75 md:scale-100 transition-transform">
                    <Image
                      src={
                        isDark
                          ? "/images/dark/weightlog.png"
                          : "/images/light/weightlog-light.png"
                      }
                      alt="Weight Log"
                      fill
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
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
                <div className="shadow-lg shadow-zinc-500/20 inline-flex items-center gap-2 bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 px-4 py-2 text-sm text-white rounded-full font-medium">
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

        {/* Get Started CTA */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="w-full py-16 md:py-32 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-500/10 via-zinc-500/5 to-zinc-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(113,113,122,0.15),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />

          <div className="container px-4 md:px-6 mx-auto relative">
            <motion.div
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              <div className="flex flex-col items-center justify-center space-y-8 text-center">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/15 via-sky-500/15 to-blue-500/15 dark:from-blue-500/10 dark:via-sky-500/10 dark:to-blue-500/10 border border-blue-500/40 dark:border-blue-500/30 relative overflow-hidden group"
                  >
                    {/* Animated shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut",
                      }}
                    />
                    <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-sky-600 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent relative z-10">
                      Ready to Transform?
                    </span>
                  </motion.div>

                  <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                    <GradientText>
                      Start Your Journey
                      <br />
                      Today
                    </GradientText>
                  </h2>
                  <p className="max-w-[600px] text-lg md:text-xl text-muted-foreground mx-auto leading-relaxed">
                    Join thousands of athletes transforming their performance
                    with Endurofy&apos;s all-in-one platform.
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-zinc-500/30 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-300" />
                    <Input
                      placeholder="Enter your email to get started"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="relative pr-32 rounded-full py-6 bg-background border-2 border-muted hover:border-primary/50 transition-colors text-base"
                    />
                    <Button
                      size="sm"
                      className="arrow-button rounded-full px-4 py-2 h-9 bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-200 dark:hover:bg-zinc-100 dark:text-zinc-900 text-white absolute right-2 top-1/2 -translate-y-1/2 shadow-lg"
                      onClick={handleStartNow}
                    >
                      Start Free
                      <svg
                        className="arrow-icon ml-1"
                        viewBox="0 -3.5 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
            </motion.div>
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
