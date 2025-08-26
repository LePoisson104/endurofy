"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Activity,
  BarChart3,
  Calendar,
  Heart,
  Menu,
  Dumbbell,
  Sparkle,
  CalendarSync,
  X,
  Check,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LandingPageThemeToggle } from "@/components/buttons/landing-page-theme-toggle";
import { useGetCurrentTheme } from "@/hooks/use-get-current-theme";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useRef } from "react";
import {
  FeatureCard,
  PricingFeature,
} from "@/components/cards/landingpage-cards";
import { useRouter } from "next/navigation";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
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

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

const accordionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

const pricingCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const menuVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
    transition: { type: "tween", duration: 0.25, ease: "easeInOut" },
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "tween", duration: 0.25, ease: "easeInOut" },
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
    <div className="flex min-h-[100dvh] flex-col">
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
                custom={2}
                variants={navLinkVariants}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href="#pricing"
                  onClick={(e) => scrollToSection(e, "pricing")}
                  className="text-sm font-medium hover:text-primary nav-link"
                >
                  Pricing
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
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Strengthen Your Endurance,
                    <br />
                    Enhance Your Life
                  </h1>
                  <p className="max-w-[600px] text-muted-background md:text-xl mx-auto lg:mx-0">
                    Endurofy helps you track your endurance activities, analyze
                    your performance, and reach your fitness goals faster.
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
                      <Check className="h-4 w-4" />
                      <p className="text-xs">Free 7-day trial</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className="h-4 w-4" />
                      <p className="text-xs">No credit card required</p>
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
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
                icon={<Calendar className="h-6 w-6" />}
                title="Training Programs"
                description="Follow personalized training programs designed to help you reach your goals."
              />
              <FeatureCard
                icon={<CalendarSync className="h-6 w-6" />}
                title="Auto-filled Workouts"
                description="Endurofy pre-fills each day in your workout log with the exercises from your program."
              />
              <FeatureCard
                icon={<Activity className="h-6 w-6" />}
                title="Advanced Tracking"
                description="Track workouts, and daily weights with detailed metrics."
              />
              <FeatureCard
                icon={<BarChart3 className="h-6 w-6" />}
                title="Performance Analytics"
                description="Get insights into your training with detailed charts and progress tracking."
              />
              <FeatureCard
                icon={<Dumbbell className="h-6 w-6" />}
                title="Workout Explorer"
                description="Explore workouts from our library and add them to your own training plans."
              />

              <FeatureCard
                icon={<Heart className="h-6 w-6" />}
                title="Health Integration"
                description="Connect with Apple Health, Google Fit, and other platforms for a complete picture."
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
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
                <div className="pulse pulse-1">1</div>
                <h3 className="text-xl font-bold">
                  Create Your Workout program
                </h3>
                <p className="text-muted-foreground">
                  Design your custom training plan with the flexibility to match
                  your goals, whether it&apos;s strength, endurance, or overall
                  fitness.
                </p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="pulse pulse-2">2</div>
                <h3 className="text-xl font-bold">Auto-filled Workouts</h3>
                <p className="text-muted-foreground">
                  Stay focused &amp; Endurofy pre-fills each day in your workout
                  log with the exercises from your program, so all you need to
                  do is log your reps and weights.
                </p>
              </motion.div>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="pulse pulse-3">3</div>
                <h3 className="text-xl font-bold">Track and Progress</h3>
                <p className="text-muted-foreground">
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
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
                className="relative aspect-[9/20] overflow-hidden rounded-xl bg-muted drop-shadow-xl  dark:drop-shadow-[0_15px_40px_rgba(30,30,30,1)]"
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
                className="relative aspect-[9/20] overflow-hidden rounded-xl bg-muted md:translate-y-10 drop-shadow-xl dark:drop-shadow-[0_15px_40px_rgba(30,30,30,1)]"
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
                className="relative aspect-[9/20] overflow-hidden rounded-xl bg-muted drop-shadow-xl dark:drop-shadow-[0_15px_40px_rgba(30,30,30,1)]"
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

        {/* Pricing */}
        <motion.section
          id="pricing"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
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
                  Pricing
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Simple, transparent pricing
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that's right for your fitness journey.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3 lg:grid-cols-3 justify-center"
            >
              <motion.div
                variants={pricingCardVariants}
                className="flex flex-col rounded-xl border bg-card p-6 text-center mx-auto max-w-xs w-full h-[500px] justify-between"
              >
                <div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Free</h3>
                    <p className="text-muted-foreground text-sm">
                      Essential features for casual athletes
                    </p>
                  </div>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="ml-1 text-muted-foreground">/month</span>
                  </div>
                  <ul className="mt-6 space-y-2 text-sm">
                    <PricingFeature>Workout and weight tracking</PricingFeature>
                    <PricingFeature>
                      Create up to 2 workout programs
                    </PricingFeature>
                    <PricingFeature>
                      Limit access to workout programs library
                    </PricingFeature>
                    <PricingFeature>
                      Basic analytics and insights
                    </PricingFeature>
                  </ul>
                </div>
                <div className="mt-6">
                  <Link href="#download">
                    <Button className="w-full" variant="outline">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                variants={pricingCardVariants}
                className="flex flex-col rounded-xl border bg-card p-6 shadow-lg ring-2 ring-primary text-center mx-auto max-w-xs w-full h-[500px] justify-between"
              >
                <div>
                  <div className="space-y-2">
                    <div className="inline-block rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                      Popular
                    </div>
                    <h3 className="text-xl font-bold">Pro</h3>
                    <p className="text-muted-foreground text-sm">
                      Advanced features for dedicated athletes
                    </p>
                  </div>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-3xl font-bold">$9.99</span>
                    <span className="ml-1 text-muted-foreground">/month</span>
                  </div>
                  <ul className="mt-6 space-y-2 text-sm">
                    <PricingFeature>Everything in Free</PricingFeature>
                    <PricingFeature>
                      Create up to 10 workout programs
                    </PricingFeature>
                    <PricingFeature>
                      Have full access to the workout programs library
                    </PricingFeature>
                    <PricingFeature>
                      Advanced analytics and insights
                    </PricingFeature>
                    <PricingFeature>
                      Import and export wokrout programs with other pro members
                    </PricingFeature>
                  </ul>
                </div>
                <div className="mt-6">
                  <Link href="#download">
                    <Button className="w-full">7-Day Free Trial</Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                variants={pricingCardVariants}
                className="flex flex-col rounded-xl border bg-card p-6 text-center mx-auto max-w-xs w-full h-[500px] justify-between"
              >
                <div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Annual</h3>
                    <p className="text-muted-foreground text-sm">
                      billed annually
                    </p>
                  </div>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-3xl font-bold">$8.33</span>
                    <span className="ml-1 text-muted-foreground">/month*</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    *$100 annually billed
                  </span>
                  <ul className="mt-6 space-y-2 text-sm">
                    <PricingFeature>Everything in Free</PricingFeature>
                    <PricingFeature>
                      Create up to 10 workout programs
                    </PricingFeature>
                    <PricingFeature>
                      Have full access to the workout programs library
                    </PricingFeature>
                    <PricingFeature>
                      Advanced analytics and insights
                    </PricingFeature>
                    <PricingFeature>
                      Import and export wokrout programs with other pro members
                    </PricingFeature>
                  </ul>
                </div>
                <div className="mt-6">
                  <Link href="#download">
                    <Button className="w-full" variant="outline">
                      7-Day Free Trial
                    </Button>
                  </Link>
                </div>
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
                  Frequently asked questions
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to know about Endurofy.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl py-12">
              <Accordion type="single" collapsible className="w-full">
                <motion.div variants={staggerContainer}>
                  <motion.div variants={accordionVariants}>
                    <AccordionItem value="item-1">
                      <AccordionTrigger className="text-base font-medium">
                        Which activities does Endurofy support?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Endurofy supports running, cycling, swimming, hiking,
                        trail running, walking, and many more endurance
                        activities.
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                  <motion.div variants={accordionVariants}>
                    <AccordionItem value="item-2">
                      <AccordionTrigger className="text-base font-medium">
                        Does Endurofy work with my smartwatch?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Yes, Endurofy integrates with most popular devices
                        including Garmin, Apple Watch, Fitbit, Polar, Suunto,
                        and more.
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                  <motion.div variants={accordionVariants}>
                    <AccordionItem value="item-3">
                      <AccordionTrigger className="text-base font-medium">
                        Can I export my data from Endurofy?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Pro users can export their data in various formats
                        including GPX, FIT, and CSV.
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                  <motion.div variants={accordionVariants}>
                    <AccordionItem value="item-4">
                      <AccordionTrigger className="text-base font-medium">
                        Is there a free trial for the paid plans?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Yes, we offer a 7-day free trial no credit card
                        required.
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                  <motion.div variants={accordionVariants}>
                    <AccordionItem value="item-5">
                      <AccordionTrigger className="text-base font-medium">
                        How can I re-verify my email?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        If you accidentally close out the verification tab, you
                        can either contact the support team at{" "}
                        <a
                          href="mailto:endurofy@gmail.com"
                          className="text-blue-400/80 hover:underline"
                        >
                          endurofy@gmail.com
                        </a>{" "}
                        or you can wait 24 hours to sign up again.
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                  <motion.div variants={accordionVariants}>
                    <AccordionItem value="item-6">
                      <AccordionTrigger className="text-base font-medium">
                        Can I switch between plans?
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        Yes, you can upgrade or downgrade your plan at any time.
                        Changes take effect at your next billing cycle.
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                </motion.div>
              </Accordion>
            </div>
          </div>
        </motion.section>

        {/* Newsletter */}
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
                  Get started with Endurofy today and join thousands of athletes
                  who are tracking, improving, and conquering their fitness
                  goals.
                </p>
              </div>

              <div className={`relative flex-1 ${isMobile ? "w-3/4" : "w-md"}`}>
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
      <footer className="w-full border-t bg-background">
        <div className="container flex flex-col gap-6 py-8 md:py-12 lg:py-16 px-4 md:px-6 mx-auto">
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-12">
            <div className="flex flex-col gap-3 lg:max-w-sm">
              <Link href="/" onClick={(e) => scrollToSection(e, "hero")}>
                <div className="flex items-center gap-1">
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
              <p className="text-sm text-muted-foreground">
                Endurofy helps endurance athletes track, analyze, and improve
                their performance with powerful tools and a supportive
                community.
              </p>
              <div className="flex gap-4">
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                      ry="5"
                    ></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Facebook</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                </Link>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="#features"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#pricing"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Integrations
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#faq"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Press
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Community
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Training Tips
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Events
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Licenses
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-center sm:text-left">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Endurofy. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground justify-center sm:justify-end">
              <Link href="#" className="hover:underline underline-offset-4">
                Terms
              </Link>
              <Link href="#" className="hover:underline underline-offset-4">
                Privacy
              </Link>
              <Link href="#" className="hover:underline underline-offset-4">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile menu panel MOVED HERE, as a sibling to header, main, and footer */}
      {isMobile && (
        <motion.div
          className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-background p-4 shadow-xl flex flex-col backdrop-filter backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 overflow-y-auto"
          initial="hidden"
          animate={isMenuOpen ? "visible" : "hidden"}
          variants={menuVariants}
          ref={menuRef}
        >
          {/* Close button inside the panel */}
          <div className="flex justify-end w-full mb-3 standalone:pt-14">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Close menu"
              className="h-7 w-7"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Original navigation content */}
          <nav className="flex flex-col gap-2">
            <Link
              href="#features"
              onClick={(e) => scrollToSection(e, "features")}
              className="text-sm font-medium hover:text-primary py-1.5"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, "how-it-works")}
              className="text-sm font-medium hover:text-primary py-1.5"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              onClick={(e) => scrollToSection(e, "pricing")}
              className="text-sm font-medium hover:text-primary py-1.5"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              onClick={(e) => scrollToSection(e, "faq")}
              className="text-sm font-medium hover:text-primary py-1.5"
            >
              FAQ
            </Link>
            <div className="flex gap-2 pt-1 pb-1">
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
      )}
    </div>
  );
}
