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
              Tracking—enhanced by AI-powered insights to help you plan smarter
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
              By consolidating the three core features of fitness tracking into
              one app, Endurofy helps you achieve your fitness goals by
              providing a simple and effective way to track your progress,
              monitor your nutrition, and plan smarter workouts with AI-powered
              insights.
            </AccordionContent>
          </AccordionItem>
        </motion.div>
        <motion.div variants={accordionVariants}>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-base font-medium">
              Is Endurofy free to use?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              Yes, Endurofy offer a free plan with limited features. Users can
              have full access to the three core features of the app, including
              the ability to create up to 3 workout programs and unlimited
              workout logs, food logs, and weight logs.
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
              Endurofy goes beyond basic tracking by actively adapting to you.
              Unlike traditional fitness apps that simply log data, Endurofy
              analyzes your workouts, weight trends, and consistency to deliver
              AI-powered insights and adaptive training recommendations—helping
              you train smarter, recover better, and make consistent progress
              over time.
            </AccordionContent>
          </AccordionItem>
        </motion.div>
      </motion.div>
    </Accordion>
  );
}
