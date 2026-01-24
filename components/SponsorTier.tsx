"use client";

import { motion, Variants } from "framer-motion";

interface SponsorTierProps {
  title: string;
  sponsors: {
    name: string;
    logo_url?: string | null;
    website_url?: string | null;
  }[];
  id?: string;
}

// Animation variants matching Teams page style
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function SponsorTier({
  title,
  sponsors,
  id,
}: SponsorTierProps) {

  // Check if this is a "To be Announced" case
  const isTBA = sponsors.length === 1 && sponsors[0].name === "To be declared";

  return (
    <section
      id={id}
      className="w-full flex flex-col items-center mt-16 md:mt-24 mb-14 px-4 scroll-mt-24"
    >
      {/* Tier title */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        className="
          inline-flex
          px-7 md:px-10
          py-3
          border border-white/60
          text-white
          text-sm md:text-base
          font-semibold
          uppercase
          tracking-[0.1em]
          rounded-[3px]
          mb-14
        "
      >
        {title}
      </motion.div>

      {/* Sponsors Container - Using Flexbox for centering */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        className="
          flex flex-wrap 
          justify-center 
          gap-x-10 md:gap-x-16 
          gap-y-12 md:gap-y-16
          w-full
          max-w-[1200px]
          mx-auto
        "
      >
        {isTBA ? (
          <motion.div variants={fadeInUp} className="text-gray-400 text-lg italic tracking-wider">
            To be Announced
          </motion.div>
        ) : (
          sponsors.map((s, i) => (
            <SponsorBox key={i} name={s.name} logo_url={s.logo_url} website_url={s.website_url} />
          ))
        )}
      </motion.div>
    </section>
  );
}

import { useDynamicImageSize } from "@/hooks/useDynamicImageSize";

function SponsorBox({
  name,
  logo_url,
  website_url,
}: {
  name: string;
  logo_url?: string | null;
  website_url?: string | null;
}) {
  const { width, height } = useDynamicImageSize('sponsor');

  // Avoid rendering until size is calculated to prevent layout shift or hydration mismatch
  // optional: could render a placeholder with min size
  if (width === 0) return null;

  const content = (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="flex flex-col items-center group"
    >
      {/* Sponsor image box */}
      <div
        style={{ width, height }}
        className="
          bg-white/5 
          backdrop-blur-sm
          border border-white/10
          rounded-xl
          shadow-lg
          flex items-center justify-center
          overflow-hidden
          transition-all
          duration-300
          group-hover:border-white/30
          group-hover:bg-white/10
          group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]
          p-6
        "
      >
        {logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo_url}
            alt={name}
            className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
            loading="lazy"
          />
        ) : (
          <span className="text-gray-400 font-bold text-xl opacity-40 group-hover:opacity-80 transition-opacity">
            {name.charAt(0)}
          </span>
        )}
      </div>

      {/* Name plate */}
      <div className="mt-5 text-center px-2">
        <p className="text-[15px] md:text-[17px] text-gray-300 font-medium tracking-wide group-hover:text-white transition-colors duration-300">
          {name}
        </p>
      </div>
    </motion.div>
  );

  if (website_url) {
    return (
      <a
        href={website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none"
      >
        {content}
      </a>
    );
  }

  return content;
}
