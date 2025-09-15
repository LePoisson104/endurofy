import { motion } from "framer-motion";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const accordionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
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

export function MotionAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <motion.div variants={staggerContainer}>
        <motion.div variants={accordionVariants}>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-base font-medium">
              What is Endurofy?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Endurofy is a fitness tracking app with three core features:
              Workout Logging, Workout Programs, and Weight Tracking—helping you
              plan workouts, track progress, and monitor nutrition with simple
              logs and powerful insights.
            </AccordionContent>
          </AccordionItem>
        </motion.div>
        <motion.div variants={accordionVariants}>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-base font-medium">
              How will Endurofy help me reach my fitness goals?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              By consolidate the three core features of fitness tracking into
              one app, Endurofy helps you achieve your fitness goals by
              providing a simple and effective way to track your progress and
              monitor your nutrition.
            </AccordionContent>
          </AccordionItem>
        </motion.div>
        <motion.div variants={accordionVariants}>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-base font-medium">
              Is Endurofy free to use?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, Endurofy is free to use and open source. You can create up to
              3 workout programs and unlimited workout logs, food logs, and
              weight logs.
            </AccordionContent>
          </AccordionItem>
        </motion.div>
        <motion.div variants={accordionVariants}>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-base font-medium">
              Who is Endurofy for?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Endurofy is for anyone looking to take control of their
              fitness—whether you&apos;re a beginner building consistency, an
              intermediate lifter tracking progress, or an advanced athlete who
              wants structured programs and detailed insights.
            </AccordionContent>
          </AccordionItem>
        </motion.div>
        <motion.div variants={accordionVariants}>
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-base font-medium">
              What makes Endurofy different from other fitness apps?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Endurofy stands out by combining simplicity with structure—you can
              build full workout programs that automatically generate exercises
              and sets for each day, log workouts effortlessly, and track your
              weight and nutrition with clear insights. Unlike many apps that
              overwhelm with features or focus on just one area, Endurofy keeps
              everything streamlined so you can focus on progress, not data
              entry.
            </AccordionContent>
          </AccordionItem>
        </motion.div>
      </motion.div>
    </Accordion>
  );
}
