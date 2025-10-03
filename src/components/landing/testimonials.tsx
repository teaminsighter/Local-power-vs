"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    name: "Aoife O'Malley",
    location: "Malahide, Co. Dublin",
    avatar: "AO",
    quote: "The whole process was seamless. The Local Power team handled everything from the grant application to the final checks. Our electricity bill has been cut by more than half. I can't recommend them enough!",
  },
  {
    name: "Brian Walsh",
    location: "Knocklyon, Dublin 16",
    avatar: "BW",
    quote: "I was worried about the disruption, but the installation was done in a day and a half. The lads were professional, tidy, and the system looks great. It's fantastic knowing we're protected from price hikes.",
  },
  {
    name: "Sinead Murphy",
    location: "Clontarf, Dublin 3",
    avatar: "SM",
    quote: "Top-quality German panels and a local Irish team for support – it was a no-brainer. The app is brilliant for tracking our usage and savings. We're even charging the car with free sunshine!",
  },
];

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    };
  },
};


export function Testimonials() {
  const [[page, direction], setPage] = useState([0, 0]);

  // We have to use a modulo operator to cycle the index.
  const testimonialIndex = ((page % testimonials.length) + testimonials.length) % testimonials.length;

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    { offset, velocity }: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
  ) => {
    const swipeThreshold = 50; // Minimum drag distance to trigger a swipe

    if (offset.x < -swipeThreshold) {
      paginate(1); // Swiped left, show next
    } else if (offset.x > swipeThreshold) {
      paginate(-1); // Swiped right, show previous
    }
  };


  return (
    <section id="testimonials" className="w-full bg-secondary/50 py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">What Dublin Homeowners Are Saying</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Don't just take our word for it. Hear from our happy customers across the county.
          </p>
        </div>
        
        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden relative h-[480px] sm:h-[420px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                id={`testimonial-slide-${testimonialIndex}`}
              >
                <Card className="bg-card shadow-2xl border-0 w-full flex flex-col pointer-events-none">
                  <CardContent className="p-8 sm:p-12 flex flex-col flex-1 items-center text-center">
                    <Avatar className="h-24 w-24 mb-6 border-4 border-primary/50 shadow-lg">
                      <AvatarImage src={`https://placehold.co/100x100.png`} alt={testimonials[testimonialIndex].name} />
                      <AvatarFallback className="text-3xl">{testimonials[testimonialIndex].avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex mb-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-7 h-7 fill-accent text-accent" />
                      ))}
                    </div>
                    <blockquote className="text-muted-foreground text-lg sm:text-xl leading-relaxed italic flex-1 mb-6">
                      "{testimonials[testimonialIndex].quote}"
                    </blockquote>
                    <div>
                      <p className="font-bold text-xl">{testimonials[testimonialIndex].name}</p>
                      <p className="text-base text-muted-foreground">{testimonials[testimonialIndex].location}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <button onClick={() => paginate(-1)} className="absolute top-1/2 left-0 sm:-left-16 transform -translate-y-1/2 bg-card/80 text-primary p-2 rounded-full hover:bg-card transition-colors z-10 shadow-md border carousel-button" id="testimonial-prev">
              <ChevronLeft size={28} />
          </button>
          <button onClick={() => paginate(1)} className="absolute top-1/2 right-0 sm:-right-16 transform -translate-y-1/2 bg-card/80 text-primary p-2 rounded-full hover:bg-card transition-colors z-10 shadow-md border carousel-button" id="testimonial-next">
              <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
}
