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
              Endurofy is a fitness tracking app built around three core
              features—Workout Logging, Workout Programs, and Weight
              Tracking—enhanced by intelligent insights to help you plan smarter
              workouts, track progress, and monitor nutrition with ease.
            </AccordionContent>
          </AccordionItem>
        </motion.div>
        <motion.div variants={accordionVariants}>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-base font-medium">
              How will Endurofy help me reach my fitness goals?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              By consolidating the three core pillars of fitness tracking into
              one platform, Endurofy eliminates the need to switch between
              apps—providing a simple, effective way to track progress, monitor
              nutrition, and plan smarter workouts.
            </AccordionContent>
          </AccordionItem>
        </motion.div>
        <motion.div variants={accordionVariants}>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-base font-medium">
              Is Endurofy free to use?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes. Endurofy is completely free. All core features—including
              workout logging, workout programs, weight tracking, and nutrition
              tracking—are available at no cost. No subscriptions. No hidden
              fees.
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
      </motion.div>
    </Accordion>
  );
}
