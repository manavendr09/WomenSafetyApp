import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import './HowItWorks.css';

const steps = [
  "Open the app and register your details",
  "Add emergency contacts",
  "Use SOS button for instant alerts",
  "Track safest route with live GPS",
  "Access self-defense tips and helplines",
];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const scrollTop = window.scrollY;
      const offsetTop = containerRef.current?.offsetTop;
      const visibleHeight = scrollTop + window.innerHeight - offsetTop;
      const totalHeight = containerRef.current?.scrollHeight;

      if (rect && totalHeight) {
        const calculatedHeight = Math.min(visibleHeight, totalHeight);
        setLineHeight(calculatedHeight);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="timeline-container" ref={containerRef}>
      {/* Central Vertical Line */}
      <motion.div
        className="timeline-line"
        style={{ height: lineHeight }}
      />

      <div className="timeline-items">
        {steps.map((text, index) => {
          const isLeft = index % 2 === 0;
          return (
            <motion.div
              key={index}
              className={`timeline-item ${isLeft ? "left" : "right"}`}
              initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="dot" />
              <div className="content">{text}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
