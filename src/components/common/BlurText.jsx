import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const BlurText = ({
  text = '',
  delay = 150,
  className = '',
  threshold = 0.1,
  rootMargin = '-100px',
  staggerDelay = 0.1,
  duration = 0.8
}) => {
  const words = text.split(' ');
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <span ref={ref} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2"
          initial={{ 
            opacity: 0, 
            filter: 'blur(8px)',
            y: 20
          }}
          animate={inView ? {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0
          } : {
            opacity: 0,
            filter: 'blur(8px)',
            y: 20
          }}
          transition={{
            duration: duration,
            delay: index * staggerDelay,
            ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth animation
            filter: { duration: duration * 0.8 }, // Faster blur transition
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

export default BlurText;
