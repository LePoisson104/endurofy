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

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

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

  return (
    <div className="flex min-h-[100dvh] flex-col landing-page">
      {/* <div className="animated-mesh-gradient"></div> */}
      {/* Header moved into hero section */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 w-full supports-[backdrop-filter]:bg-transparent standalone:fixed standalone:pt-14"
        style={{ backdropFilter: `blur(${headerBlur}px)` }}
      >
        <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-6">
          <Link href="/" onClick={(e) => scrollToSection(e, "hero")}>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold hover:text-primary">
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
          className="relative z-0 w-full py-12 md:py-24 lg:py-32 xl:py-48 px-4 md:px-6"
        >
          <div className="container px-4 md:px-6 mx-auto mt-16">
            {" "}
            {/* Changed pt-16 to mt-16 */}
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px] items-center justify-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center lg:text-left">
                  <h1
                    className={`text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none ${
                      isMobile ? "mt-15" : ""
                    }`}
                  >
                    Strengthen Your Endurance,
                    <br />
                    Enhance Your Life
                  </h1>
                  <p className="max-w-[600px] text-muted-background text-sm mx-auto lg:mx-0">
                    Endurofy makes it easy to track your endurance activities,
                    stay consistent, and achieve your fitness goals faster.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[200px]:flex-col justify-center lg:justify-start sm:w-full">
                  <div className="relative flex-1 max-w-md">
                    <Input
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pr-28 rounded-full py-5 bg-muted/50 text-muted-background placeholder:text-foreground"
                    />

                    <Button
                      size="sm"
                      className="arrow-button rounded-full px-3 py-1 h-7 bg-primary text-primary-foreground absolute right-2 top-1/2 -translate-y-1/2"
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
                  <div className="flex flex gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs indent-2">
                        Get set up in 5 minutes. No credit card required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative aspect-square w-full max-w-[400px] overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src="/placeholder.svg?height=800&width=400"
                    alt="Endurofy App Screenshot"
                    fill
                    className="object-cover"
                  />
                </div>
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
                <div className="inline-flex items-center gap-2 bg-primary px-3 py-1 text-sm text-primary-foreground rounded-full shadow-lg shadow-primary/70">
                  <Sparkle className="h-3 w-3" />
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything you need to reach your peak
                </h2>
                <p className="max-w-[900px] text-muted-foreground text-sm">
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
                <div className="inline-flex items-center gap-2 bg-primary px-3 py-1 text-sm text-primary-foreground rounded-full shadow-lg shadow-primary/70">
                  <Sparkle className="h-3 w-3" />
                  How it works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Simple, intuitive, and effective
                </h2>
                <p className="max-w-[900px] text-muted-foreground text-sm">
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
                <div className="inline-flex items-center gap-2 bg-primary px-3 py-1 text-sm text-primary-foreground rounded-full shadow-lg shadow-primary/70">
                  <Sparkle className="h-3 w-3" />
                  Intuitive interface
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Effortless Interactions, Powerful Experiences
                </h2>
                <p className="max-w-[900px] text-muted-foreground text-sm">
                  Beautiful, intuitive interface that helps you focus on what
                  matters most - your performance.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3"
            >
              <motion.div
                variants={imageVariants}
                className="relative aspect-[9/20] overflow-hidden rounded-xl bg-muted drop-shadow-xl border w-full max-w-[300px] md:max-w-[400px] mx-auto"
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
                className="relative aspect-[9/20] overflow-hidden rounded-xl md:translate-y-10 bg-muted drop-shadow-xl border w-full max-w-[300px] md:max-w-[400px] mx-auto"
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
                className="relative aspect-[9/20] overflow-hidden rounded-xl bg-muted drop-shadow-xl border w-full max-w-[300px] md:max-w-[400px] mx-auto"
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
                <div className="inline-flex items-center gap-2 bg-primary px-3 py-1 text-sm text-primary-foreground rounded-full shadow-lg shadow-primary/70">
                  <Sparkle className="h-3 w-3" />
                  FAQ
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Questions & Answers
                </h2>
                <p className="max-w-[900px] text-muted-foreground text-sm">
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
                  Get started with Endurofy
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
                  className="pr-28 rounded-full py-5 bg-muted/50 text-muted-background placeholder:text-foreground"
                />

                <Button
                  size="sm"
                  className="arrow-button rounded-full px-3 py-1 h-7 bg-primary text-primary-foreground absolute right-2 top-1/2 -translate-y-1/2"
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
    </div>
  );
}
