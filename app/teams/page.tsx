"use client"

import TeamNavigation from "@/components/TeamNavigation"
import Image from "next/image"
import Footer from "@/components/ui/Footer"
import { Linkedin, Instagram } from "lucide-react"
import { motion, type Variants, useMotionValue, useTransform, useSpring } from "framer-motion"
import { useCallback, useMemo } from "react"
import { useDynamicImageSize } from "@/hooks/useDynamicImageSize"

type TeamMember = {
  name: string;
  position: string;
  image: string;
  instagram?: string;
  linkedin?: string;
}

// Clean animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15
    }
  }
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.06,
      ease: "easeOut"
    }
  })
}

const glowVariants: Variants = {
  rest: {
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
    scale: 1
  },
  hover: {
    boxShadow: "0 12px 35px rgba(0, 0, 0, 0.3)",
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

const imageHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

const socialIconVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.15,
    y: -2,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { scale: 0.95 }
}

// Clean 3D Tilt Card Component
const TeamMemberCard = ({ member, index }: { member: TeamMember; index: number }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Dynamic size hook
  const { width, height } = useDynamicImageSize('team');

  // Subtle rotation
  const rotateX = useTransform(y, [-100, 100], [5, -5])
  const rotateY = useTransform(x, [-100, 100], [-5, 5])

  // Smooth spring physics
  const springConfig = useMemo(() => ({ stiffness: 150, damping: 20 }), [])
  const rotateXSpring = useSpring(rotateX, springConfig)
  const rotateYSpring = useSpring(rotateY, springConfig)

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  // Prevent hydration styling mismatch or layout shift if needed, or just let it render
  if (width === 0) return null;

  return (
    <motion.div
      className="flex flex-col items-center"
      style={{ perspective: 800 }}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      custom={index}
    >
      <motion.div
        className="relative cursor-pointer"
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        variants={glowVariants}
        initial="rest"
        whileHover="hover"
      >
        <motion.div
          className="bg-gray-900 rounded-lg mb-3 md:mb-4 overflow-hidden relative"
          style={{ width, height }}
          variants={imageHoverVariants}
        >
          {/* Subtle gradient overlay */}
          <div
            className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/30 to-transparent"
          />

          <Image
            src={member.image || "/Synapse Logo.png"}
            alt={member.name}
            width={500}
            height={500}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="text-center w-full px-1"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 + index * 0.03, duration: 0.4, ease: "easeOut" }}
      >
        <h3 className="font-roboto text-white text-sm md:text-lg leading-tight break-words font-medium">
          {member.name}
        </h3>
        <p className="font-roboto text-gray-400 text-xs md:text-sm mt-1">
          {member.position}
        </p>

        <motion.div
          className="flex gap-4 justify-center mt-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.03, duration: 0.3 }}
        >
          <motion.a
            href={member.instagram || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-pink-400 transition-colors"
            variants={socialIconVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <Instagram className="w-4 h-4 md:w-5 md:h-5" />
          </motion.a>

          <motion.a
            href={member.linkedin || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-blue-400 transition-colors"
            variants={socialIconVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            <Linkedin className="w-4 h-4 md:w-5 md:h-5" />
          </motion.a>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <motion.div
    className="flex flex-col items-center mb-12"
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.5 }}
  >
    <h2 className="font-joker text-white text-3xl md:text-4xl border border-gray-600/50 px-8 py-4 text-center">
      {title}
    </h2>

    {subtitle && (
      <motion.p
        className="text-gray-400 text-center mt-4 text-sm md:text-base"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {subtitle}
      </motion.p>
    )}
  </motion.div>
)

const TeamSection = ({ title, members, subtitle }: { title: string; members: TeamMember[]; subtitle?: string }) => (
  <section className="w-full py-20 px-4 md:px-8 flex flex-col items-center overflow-hidden">
    <SectionTitle title={title} subtitle={subtitle} />

    {members.length === 1 ? (
      <motion.div
        className="flex justify-center w-full"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <TeamMemberCard member={members[0]} index={0} />
      </motion.div>
    ) : (
      <motion.div
        className="flex flex-wrap justify-center gap-8 md:gap-10 lg:gap-14 w-full max-w-7xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {members.map((member, idx) => (
          <motion.div
            key={`${member.name}-${idx}`}
            className="w-[calc(50%-16px)] sm:w-[calc(50%-20px)] md:w-[calc(33.33%-28px)] lg:w-[calc(25%-42px)] flex justify-center"
            variants={cardVariants}
            custom={idx}
          >
            <TeamMemberCard member={member} index={idx} />
          </motion.div>
        ))}
      </motion.div>
    )}
  </section>
)

// Simple animated separator
const AnimatedSeparator = () => (
  <div className="relative w-full py-6 flex items-center justify-center">
    <motion.div
      className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  </div>
)

export default function TeamPage() {
  const mainTeamMembers: TeamMember[] = [
    { name: "Om Santoki", position: "Convenor", image: "/images_teams/om_conv.jpg", instagram: "https://www.instagram.com/om_santoki?igsh=MWpzNm92YWI5Nzh4NA==", linkedin: "https://in.linkedin.com/in/omsantoki" },
    { name: "Sujal Mohapatra", position: "Deputy Convenor", image: "/images_teams/sujal_dyconv.jpg", instagram: "https://www.instagram.com/sujal.__.mohapatra?igsh=aTRjbHk2djhlcXEx", linkedin: "https://www.linkedin.com/in/sujal-mohapatra-1319a6289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Pratham Lakhani", position: "Public Relations Head", image: "/images_teams/Pratham_3r.JPG", instagram: "https://www.instagram.com/pratham._.lakhani_911?igsh=MWQ1bXBhZ2t2c3Yxeg==", linkedin: "https://www.linkedin.com/in/pratham-lakhani-1a16051b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Rujal Jiyani", position: "Events Head", image: "/images_teams/rujal_3r.jpg", instagram: "https://www.instagram.com/rujal.jiyani?igsh=MjZicDh5MzRvdHI=", linkedin: "https://www.linkedin.com/in/rujal-jiyani9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Namra Sanandiya", position: "Public Relations Head", image: "/images_teams/namra_3r.jpeg", instagram: "https://www.instagram.com/oyy_namra?igsh=MXRrM3N6bWhxM2VrNA==", linkedin: "https://www.linkedin.com/in/namra-sanandiya-146673284?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Kosha Dalsaniya", position: "Events Head", image: "/images_teams/kosha_3r.jpeg", instagram: "https://www.instagram.com/_kd1123_?igsh=dzl6bnhlcWNhcGZu&utm_source=qr", linkedin: "https://www.linkedin.com/in/kosha-dalsaniya-1478702b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
  ]

  const coreTeam: TeamMember[] = [
    { name: "Ved Dhanani", position: "Events", image: "/images_teams/ved_2n.jpg", instagram: "https://www.instagram.com/ved_dhananii?igsh=NmRoMDdkZ3N0cHdj&utm_source=qr", linkedin: "https://www.linkedin.com/in/ved-dhanani-18612631a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Heet Shah", position: "Public Relations and Website Management", image: "/images_teams/heet_2n.jpg", instagram: "https://www.instagram.com/heet._.shahh?igsh=MXh5MWtxMmh4b3F4Zg==", linkedin: "https://www.linkedin.com/in/heet-shah-468b60331?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Dev Thakkar", position: "Production ", image: "/images_teams/dev_t_2n.jpeg", instagram: "https://www.instagram.com/devvv.0103?igsh=MXd2YTcyaDlrOHM4eA%3D%3D&utm_source=qr", linkedin: "https://www.linkedin.com/in/dev-thakkar-5a73572aa?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Kevin Rank", position: "Public Relations", image: "/images_teams/kevin_2n.jpg", instagram: "https://www.instagram.com/kevinn.r97?igsh=MXdiM2ZxMXNzZTFoZQ==", linkedin: "https://www.linkedin.com/in/kevin-rank-ab9384330?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Dev Sanghani", position: "Event Production , on call", image: "/images_teams/dev_s_2n.jpg", instagram: "https://www.instagram.com/devvvv__2?igsh=MW9ibnFoOGV2cjk5Zg%3D%3D&utm_source=qr", linkedin: "https://www.linkedin.com/in/dev-sanghani-58b951321/" },
    { name: "Keval Shah", position: "Events", image: "/images_teams/keval_2n.jpg", instagram: "https://www.instagram.com/kevalshah159?igsh=aHpjd2htdXZmNXZu", linkedin: "https://www.linkedin.com/in/keval-shah-899a7a321?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Jay Trivedi", position: "Event, CD", image: "/images_teams/jay_2n.jpeg", instagram: "https://www.instagram.com/_jaytrivedi_18/", linkedin: "https://www.linkedin.com/in/jaytrivedi18/" },
    { name: "Utsav Darji ", position: "Hospitality ", image: "/images_teams/utsav_2n.jpg", instagram: "https://www.instagram.com/utsav_d06?igsh=MTk3bzhyMTUzdTBtZw%3D%3D&utm_source=qr", linkedin: "https://www.linkedin.com/in/utsav-darji-50a68b33a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Krish Paghadar", position: "Hospitality", image: "/images_teams/krish_2n.jpg", instagram: "https://www.instagram.com/the_real_krrish?igsh=MXY4MWQ0ejBzbHVibQ==", linkedin: "https://www.linkedin.com/in/krish-paghadar-33b3a0326?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },

    { name: "Rishabh Jain", position: "Mentor", image: "/images_teams/Rishabh_img.jpg", instagram: "https://www.instagram.com/rishabhjain_149/", linkedin: "https://in.linkedin.com/in/jainrishabh04" },
    { name: "Devamm Patel", position: "Mentor", image: "/images_teams/Devamm.png", instagram: "https://www.instagram.com/_devamm_12/", linkedin: "https://in.linkedin.com/in/devamm-patel-197891265" },
    { name: "Vivek Chaudhari", position: "Mentor", image: "/images_teams/Vivek_img.jpeg", instagram: "https://www.instagram.com/vivek.chaudhari_30/", linkedin: "https://in.linkedin.com/in/vivek-kirankumar-chaudhari" },
    { name: "Siddhant Gupta", position: "Mentor", image: "/images_teams/Siddhant_img.jpeg", instagram: "https://www.instagram.com/siddhant_g86/", linkedin: "https://in.linkedin.com/in/siddhant-gupta-6327b4253" },
    { name: "Bhavya Shah", position: "Mentor", image: "/images_teams/Bhavya_img.jpg", instagram: "https://www.instagram.com/bhavya_1918?igsh=b29ieW1oMTBtamhi&utm_source=qr", linkedin: "https://www.linkedin.com/in/bhavya3604?utm_source=share_via&utm_content=profile&utm_medium=member_ios" },
    { name: "Harshali Dharmik", position: "Mentor", image: "/images_teams/Harshali_img.jpg", instagram: "https://www.instagram.com/harshali__2074/", linkedin: "https://in.linkedin.com/in/harshali-dharmik-a640b3284" },
    { name: "Dev Wadhvani", position: "Mentor", image: "/images_teams/Dev_img.jpeg", instagram: "https://www.instagram.com/devwadhvani/", linkedin: "https://in.linkedin.com/in/devwadhvani" },
    { name: "Sujal Manavadariya", position: "Mentor", image: "/images_teams/Sujal_img.png", instagram: "https://www.instagram.com/_sujalmanavadariya_/", linkedin: "https://in.linkedin.com/in/sujal-manavadariya-499992252" },
    { name: "Adhiraj Roy Chowdhury ", position: "Mentor", image: "/images_teams/Adhiraj_img.jpg", instagram: "https://www.instagram.com/adhirajrc?igsh=MWUyNDIxNTdic3Zmbg==", linkedin: "https://www.linkedin.com/in/adhiraj-roy-chowdhury" },
    { name: "Kashish Khubchandani", position: "Mentor", image: "/images_teams/Kashish_img.jpg", instagram: "https://www.instagram.com/_cutest_stranger/", linkedin: "http://www.linkedin.com/in/kashish-khubchandani-281b97235" },
  ]


  const webTeam: TeamMember[] = [
    { name: "Aditya Vaish", position: "Full Stack Dev", image: "/images_teams/aditya_ws.jpg", instagram: "https://www.instagram.com/_avaish_08?igsh=MWRmOTV4b2ZiNDRuMw==", linkedin: "https://www.linkedin.com/in/aditya-vaish-370494243/" },
    { name: "Neel Khatri", position: "Full Stack Dev", image: "/images_teams/neel_ws.jpg", instagram: "https://www.instagram.com/neel212006", linkedin: "https://www.linkedin.com/in/neel-khatri-aa1618242" },
    { name: "Dhruvil Patel", position: "Backend Dev", image: "/images_teams/dhruvil_ws.jpeg", instagram: "https://www.instagram.com/dp_0205", linkedin: "https://www.linkedin.com/in/dhruvil05patel?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Chirayu Dodiya", position: "Backend Dev", image: "/images_teams/chirayu_ws.jpg", instagram: "https://www.instagram.com/chirayu_dodiya/", linkedin: "https://www.linkedin.com/in/chirayu-dodiya-3a025a2aa/" },
    { name: "Priyanshi Chauhan", position: "UI/UX Designer", image: "/images_teams/priyanshi_ws.png", instagram: "https://www.instagram.com/priyaanshii.5?igsh=MWIxbzNiM3Fxb3d4cg==", linkedin: "https://www.linkedin.com/in/priyanshichauhan01" },
    { name: "Siddh Shah", position: "Frontend Dev", image: "/images_teams/siddh_ws.jpg", instagram: "https://www.instagram.com/siddhshah22?igsh=MWc4aTJkbWFxYWV4eg==", linkedin: "https://www.linkedin.com/in/siddh-shah-b03432321?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Yash Gangwani", position: "Frontend Dev", image: "/images_teams/yash_ws.png", instagram: "https://www.instagram.com/gudda_786_?igsh=M2EwYWx3MWg4Mm53", linkedin: "https://www.linkedin.com/in/yash-gangwani" },
    { name: "Chirag Katkoriya", position: "Frontend Dev", image: "/images_teams/chirag_ws.jpg", instagram: "https://www.instagram.com/katkoriyachirag/", linkedin: "https://www.linkedin.com/in/chirag-katkoriya/" },
    { name: "Pushkar Patel", position: "Frontend Dev", image: "/images_teams/pushkar_ws.jpeg", instagram: "https://www.instagram.com/synapsedaiict?igsh=MTM4Mzk2NHNya3N1dA==", linkedin: "https://www.linkedin.com/in/pushkar-patel-409196295/?originalSubdomain=sg" },
    { name: "Heer Mehta", position: "Frontend Dev", image: "/images_teams/heer_ws.jpg", instagram: "https://www.instagram.com/heermehta0919/", linkedin: "https://www.linkedin.com/in/heer-mehta-14833928b/" },
  ]

  // Leadership team (Convenor & Deputy)
  const leadershipTeam: TeamMember[] = mainTeamMembers.slice(0, 2)

  // Heads team
  const headsTeam: TeamMember[] = mainTeamMembers.slice(2)

  // Separate mentors from core team
  const mentorsTeam: TeamMember[] = coreTeam.filter(member => member.position === "Mentor")
  const coreTeamFiltered: TeamMember[] = coreTeam.filter(member => member.position !== "Mentor")

  return (
    <main className="w-full bg-black min-h-screen overflow-x-hidden">
      <TeamNavigation />

      {/* HEADER IMAGE */}
      <motion.div
        className="relative w-full h-[65vh] min-h-[450px] overflow-hidden z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background image with subtle zoom */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <Image
            src="/teams_header.png"
            alt="Teams Header"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.95) 100%)"
          }}
        />

        {/* Title overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.h1
            className="font-joker text-white text-5xl md:text-7xl lg:text-8xl text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            style={{ textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            our team
          </motion.h1>

          <motion.p
            className="text-gray-300 text-lg md:text-xl mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            The people behind Synapse&apos; 26
          </motion.p>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.div
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
            >
              <motion.div
                className="w-1.5 h-3 bg-white/50 rounded-full mt-2"
                animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Leadership Section */}
      <section id="leadership" className="w-full py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-black">
        <div className="max-w-5xl mx-auto">
          <SectionTitle title="leadership" subtitle="Guiding Synapse' 26 to new heights" />

          <motion.div
            className="flex flex-wrap justify-center gap-12 md:gap-20"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {leadershipTeam.map((member, idx) => (
              <motion.div
                key={`leader-${idx}`}
                className="md:scale-110"
                variants={cardVariants}
                custom={idx}
              >
                <TeamMemberCard member={member} index={idx} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <AnimatedSeparator />

      {/* Heads Section */}
      <section id="heads" className="w-full bg-black">
        <TeamSection title="heads" members={headsTeam} subtitle="Leading the charge" />
      </section>

      <AnimatedSeparator />

      {/* Core Team Section */}
      <section id="core" className="w-full bg-black">
        <TeamSection title="core team" members={coreTeamFiltered} subtitle="The backbone of Synapse" />
      </section>

      <AnimatedSeparator />

      {/* Mentors Section */}
      <section id="mentors" className="w-full bg-black">
        <TeamSection title="mentors" members={mentorsTeam} subtitle="Wisdom and guidance" />
      </section>

      <AnimatedSeparator />

      {/* Web Development Team Section */}
      <section id="web" className="w-full bg-black">
        <TeamSection title="website team" members={webTeam} subtitle="Building the digital experience" />
      </section>

      <div className="h-16 bg-black" />
      <Footer />
    </main>
  )
}