"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

interface TextRevealProps {
    text: string;
}

export default function TextReveal({ text }: TextRevealProps) {
    const container = useRef<HTMLParagraphElement>(null);

    // offset ["start 0.9", "start 0.2"] makes the animation start later 
    // and end later in the scroll, effectively slowing it down relative to movement.
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start 0.9", "start 0.2"],
    });

    const words = text.split(" ");

    return (
        <p
            ref={container}
            className="flex flex-wrap justify-center text-[clamp(1.5rem,4vw,3.5rem)] font-jqka font-medium leading-[1.4] uppercase tracking-tight"
        >
            {words.map((word, i) => {
                const start = i / words.length;
                const end = start + 1 / words.length;
                return (
                    <Word key={i} progress={scrollYProgress} range={[start, end]}>
                        {word}
                    </Word>
                );
            })}
        </p>
    );
}

interface WordProps {
    children: string;
    progress: any;
    range: [number, number];
}

const Word = ({ children, progress, range }: WordProps) => {
    const amount = range[1] - range[0];
    const step = amount / children.length;

    return (
        <span className="relative mr-[0.3em] mb-[0.1em] flex">
            {children.split("").map((char, i) => {
                const start = range[0] + (i * step);
                const end = range[0] + ((i + 1) * step);
                return (
                    <Char key={i} progress={progress} range={[start, end]}>
                        {char}
                    </Char>
                );
            })}
        </span>
    );
};

interface CharProps {
    children: string;
    progress: any;
    range: [number, number];
}

const Char = ({ children, progress, range }: CharProps) => {
    // From dark gray to white
    const color = useTransform(progress, range, ["#4b5563", "#ffffff"]);

    return (
        <motion.span style={{ color }}>
            {children}
        </motion.span>
    );
};
