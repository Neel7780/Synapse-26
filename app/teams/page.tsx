"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Footer from "@/components/ui/Footer"
import { Linkedin, Instagram, ChevronDown } from "lucide-react"
import NavigationPanel from "@/components/ui/NavigationPanel"
import { Navbar } from "@/components/ui/Resizable-navbar"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type TeamMember = { 
  name: string
  position: string
  image: string
  instagram?: string
  linkedin?: string
}

// Enhanced Team Member Card with hover effects and animations
const TeamMemberCard = ({ member, index = 0 }: { member: TeamMember; index?: number }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!cardRef.current) return
    
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { 
          opacity: 0, 
          y: 60,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 90%",
            end: "top 60%",
            toggleActions: "play none none reverse",
          },
          delay: (index % 4) * 0.1,
        }
      )
    }, cardRef)

    return () => ctx.revert()
  }, [index])

  return (
    <div 
      ref={cardRef}
      className="group flex flex-col items-center opacity-0"
    >
      {/* Image Container with enhanced styling */}
      <div 
        className="relative w-32 h-32 md:w-44 md:h-44 lg:w-48 lg:h-48 mb-4 md:mb-5 overflow-hidden rounded-lg
                   border-2 border-transparent 
                   group-hover:border-red-500/50 
                   transition-all duration-500 ease-out
                   group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        
        <Image
          src={member.image || "/Synapse Logo.png"}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-500 ease-out
                     group-hover:scale-110"
          sizes="(max-width: 768px) 128px, (max-width: 1024px) 176px, 192px"
        />

        {/* Social links overlay on hover */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 z-20
                        opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0
                        transition-all duration-300 ease-out">
          {member.instagram && (
            <a 
              href={member.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center
                         text-white hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-500
                         transition-all duration-300 hover:scale-110"
              aria-label={`${member.name}'s Instagram`}
            >
              <Instagram className="w-4 h-4" />
            </a>
          )}
          {member.linkedin && (
            <a 
              href={member.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center
                         text-white hover:bg-[#0077B5]
                         transition-all duration-300 hover:scale-110"
              aria-label={`${member.name}'s LinkedIn`}
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Text content */}
      <div className="text-center w-full px-2">
        <h3 className="font-poppins font-semibold text-white text-sm md:text-base lg:text-lg 
                       leading-tight tracking-wide
                       group-hover:text-red-400 transition-colors duration-300">
          {member.name}
        </h3>
        <p className="font-roboto text-gray-400 text-xs md:text-sm mt-1.5
                      group-hover:text-gray-300 transition-colors duration-300">
          {member.position}
        </p>
      </div>
    </div>
  )
}

// Section title component with animation
const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const titleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!titleRef.current) return
    
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
          },
        }
      )
    }, titleRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={titleRef} className="text-center mb-12 md:mb-16 opacity-0">
      <h2 className="font-joker text-white text-3xl md:text-4xl lg:text-5xl 
                     relative inline-block px-8 py-3">
        <span className="relative z-10">{title}</span>
        {/* Decorative line underneath */}
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 md:w-32 h-0.5 
                         bg-gradient-to-r from-transparent via-red-500 to-transparent" />
      </h2>
      {subtitle && (
        <p className="mt-4 text-gray-400 font-roboto text-sm md:text-base max-w-lg mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}

// Enhanced Team Section with better layout
const TeamSection = ({ 
  title, 
  members, 
  subtitle,
  layout = "default" 
}: { 
  title: string
  members: TeamMember[]
  subtitle?: string
  layout?: "default" | "featured" | "compact"
}) => {
  const getGridClasses = () => {
    switch (layout) {
      case "featured":
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12"
      case "compact":
        return "flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-10"
      default:
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-12"
    }
  }

  const getItemClasses = () => {
    if (layout === "compact") {
      return "w-[calc(50%-12px)] sm:w-[calc(33.33%-16px)] md:w-[calc(25%-24px)] flex justify-center"
    }
    return ""
  }

  return (
    <section className="w-full py-12 md:py-20 px-4 md:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionTitle title={title} subtitle={subtitle} />

        {members.length === 1 ? (
          // Single member - centered with larger display
          <div className="flex justify-center">
            <div className="transform scale-110">
              <TeamMemberCard member={members[0]} index={0} />
            </div>
          </div>
        ) : (
          <div className={getGridClasses()}>
            {members.map((member, idx) => (
              <div key={`${title}-${idx}`} className={`${getItemClasses()} flex justify-center`}>
                <TeamMemberCard member={member} index={idx} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Quick navigation for jumping to sections
const QuickNav = ({ sections }: { sections: { id: string; label: string }[] }) => {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
    }
  }

  return (
    <nav 
      className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-2
                  transition-all duration-300 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
    >
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className="group flex items-center gap-2 px-3 py-2 rounded-l-full
                     bg-black/50 backdrop-blur-sm border border-gray-800
                     hover:bg-red-500/20 hover:border-red-500/50
                     transition-all duration-300"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-red-500 transition-colors" />
          <span className="text-xs text-gray-400 group-hover:text-white transition-colors whitespace-nowrap">
            {section.label}
          </span>
        </button>
      ))}
    </nav>
  )
}

export default function TeamPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll indicator animation
    if (scrollIndicatorRef.current) {
      gsap.to(scrollIndicatorRef.current, {
        y: 10,
        duration: 1.2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
      })
    }

    // Parallax effect on hero image
    if (heroRef.current) {
      const heroImage = heroRef.current.querySelector("img")
      if (heroImage) {
        gsap.to(heroImage, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
      }
    }
  }, [])

  // Team data
  const leadershipTeam: TeamMember[] = [
    { name: "Om Santoki", position: "Convenor", image: "/om_conv.jpg", instagram: "https://www.instagram.com/om_santoki?igsh=MWpzNm92YWI5Nzh4NA==", linkedin: "https://in.linkedin.com/in/omsantoki" },
    { name: "Sujal Mohapatra", position: "Deputy Convenor", image: "/sujal_dyconv.jpg", instagram: "https://www.instagram.com/sujal.__.mohapatra?igsh=aTRjbHk2djhlcXEx", linkedin: "https://www.linkedin.com/in/sujal-mohapatra-1319a6289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
  ]

  const headsTeam: TeamMember[] = [
    { name: "Pratham Lakhani", position: "Public Relations Head", image: "/Pratham_3r.jpg", instagram: "https://www.instagram.com/pratham._.lakhani_911?igsh=MWQ1bXBhZ2t2c3Yxeg==", linkedin: "https://www.linkedin.com/in/pratham-lakhani-1a16051b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Rujal Jiyani", position: "Events Head", image: "/rujal_3r.jpg", instagram: "https://www.instagram.com/rujal.jiyani?igsh=MjZicDh5MzRvdHI=", linkedin: "https://www.linkedin.com/in/rujal-jiyani9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Namra Sanandiya", position: "PR Head", image: "/namra_3r.jpeg", instagram: "https://www.instagram.com/oyy_namra?igsh=MXRrM3N6bWhxM2VrNA==", linkedin: "https://www.linkedin.com/in/namra-sanandiya-146673284?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Kosha Dalsaniya", position: "Events Head", image: "/kosha_3r.jpeg", instagram: "https://www.instagram.com/_kd1123_?igsh=dzl6bnhlcWNhcGZu&utm_source=qr", linkedin: "https://www.linkedin.com/in/kosha-dalsaniya-1478702b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
  ]
  const coreTeam: TeamMember[] = [
    { name: "Krish Paghadar", position: "Hospitality", image: "/krish_2n.jpg", instagram: "https://www.instagram.com/the_real_krrish?igsh=MXY4MWQ0ejBzbHVibQ==", linkedin: "https://www.linkedin.com/in/krish-paghadar-33b3a0326?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Ved Dhanani", position: "Events", image: "/ved_2n.jpg", instagram: "https://www.instagram.com/ved_dhananii?igsh=NmRoMDdkZ3N0cHdj&utm_source=qr", linkedin: "https://www.linkedin.com/in/ved-dhanani-18612631a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Heet Shah", position: "Public Relations & Website", image: "/heet_2n.jpg", instagram: "https://www.instagram.com/heet._.shahh?igsh=MXh5MWtxMmh4b3F4Zg==", linkedin: "https://www.linkedin.com/in/heet-shah-468b60331?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Utsav Darji", position: "Hospitality", image: "/utsav_2n.jpg", instagram: "https://www.instagram.com/utsav_d06?igsh=MTk3bzhyMTUzdTBtZw%3D%3D&utm_source=qr", linkedin: "https://www.linkedin.com/in/utsav-darji-50a68b33a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Kevin Rank", position: "Public Relations", image: "/kevin_2n.jpg", instagram: "https://www.instagram.com/kevinn.r97?igsh=MXdiM2ZxMXNzZTFoZQ==", linkedin: "https://www.linkedin.com/in/kevin-rank-ab9384330?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Dev Sanghani", position: "Event Production", image: "/dev_s_2n.jpg", instagram: "https://www.instagram.com/devvvv__2?igsh=MW9ibnFoOGV2cjk5Zg%3D%3D&utm_source=qr", linkedin: "https://www.linkedin.com/in/dev-sanghani-58b951321/" },
    { name: "Keval Shah", position: "Events", image: "/keval_2n.jpg", instagram: "https://www.instagram.com/kevalshah159?igsh=aHpjd2htdXZmNXZu", linkedin: "https://www.linkedin.com/in/keval-shah-899a7a321?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Jay Trivedi", position: "Events & CD", image: "/jay_2n.jpeg", instagram: "https://www.instagram.com/_jaytrivedi_18/", linkedin: "https://www.linkedin.com/in/jaytrivedi18/" },
    { name: "Dev Thakkar", position: "Production", image: "/dev_t_2n.jpeg", instagram: "https://www.instagram.com/devvv.0103?igsh=MXd2YTcyaDlrOHM4eA%3D%3D&utm_source=qr", linkedin: "https://www.linkedin.com/in/dev-thakkar-5a73572aa?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
  ]

  const mentorsTeam: TeamMember[] = [
    { name: "Rishabh Jain", position: "Mentor", image: "/Rishabh_img.jpg", instagram: "https://www.instagram.com/rishabhjain_149/", linkedin: "https://in.linkedin.com/in/jainrishabh04" },
    { name: "Devamm Patel", position: "Mentor", image: "/Devamm.png", instagram: "https://www.instagram.com/_devamm_12/", linkedin: "https://in.linkedin.com/in/devamm-patel-197891265" },
    { name: "Vivek Chaudhari", position: "Mentor", image: "/Vivek_img.jpeg", instagram: "https://www.instagram.com/vivek.chaudhari_30/", linkedin: "https://in.linkedin.com/in/vivek-kirankumar-chaudhari" },
    { name: "Siddhant Gupta", position: "Mentor", image: "/Siddhant_img.jpeg", instagram: "https://www.instagram.com/siddhant_g86/", linkedin: "https://in.linkedin.com/in/siddhant-gupta-6327b4253" },
    { name: "Bhavya Shah", position: "Mentor", image: "/Bhavya_img.jpg", instagram: "https://www.instagram.com/bhavya_1918?igsh=b29ieW1oMTBtamhi&utm_source=qr", linkedin: "https://www.linkedin.com/in/bhavya3604?utm_source=share_via&utm_content=profile&utm_medium=member_ios" },
    { name: "Harshali Dharmik", position: "Mentor", image: "/Harshali_img.jpg", instagram: "https://www.instagram.com/harshali__2074/", linkedin: "https://in.linkedin.com/in/harshali-dharmik-a640b3284" },
    { name: "Adhiraj Roy Chowdhury", position: "Mentor", image: "/Adhiraj_img.jpg", instagram: "https://www.instagram.com/adhirajrc?igsh=MWUyNDIxNTdic3Zmbg==", linkedin: "https://www.linkedin.com/in/adhiraj-roy-chowdhury" },    { name: "Dev Wadhvani", position: "Mentor", image: "/Dev_img.jpeg", instagram: "https://www.instagram.com/devwadhvani/", linkedin: "https://in.linkedin.com/in/devwadhvani" },
    { name: "Sujal Manavadariya", position: "Mentor", image: "/Sujal_img.png", instagram: "https://www.instagram.com/_sujalmanavadariya_/", linkedin: "https://in.linkedin.com/in/sujal-manavadariya-499992252" },
    { name: "Kashish Khubchandani", position: "Mentor", image: "/Kashish_img.jpg", instagram: "https://www.instagram.com/_cutest_stranger/", linkedin: "http://www.linkedin.com/in/kashish-khubchandani-281b97235" },
  ]


  const webTeam: TeamMember[] = [
    { name: "Aditya Vaish", position: "Full Stack Dev", image: "/aditya_ws.jpg", instagram: "https://www.instagram.com/_avaish_08?igsh=MWRmOTV4b2ZiNDRuMw==", linkedin: "https://www.linkedin.com/in/aditya-vaish-370494243/" },
    { name: "Neel Khatri", position: "Full Stack Dev", image: "/neel_ws.jpg", instagram: "https://www.instagram.com/neel212006", linkedin: "https://www.linkedin.com/in/neel-khatri-aa1618242" },
    { name: "Dhruvil Patel", position: "Backend Dev", image: "/dhruvil_ws.jpeg", instagram: "https://www.instagram.com/dp_0205", linkedin: "https://www.linkedin.com/in/dhruvil05patel?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Chirayu Dodiya", position: "Backend Dev", image: "/chirayu_ws.jpg", instagram: "https://www.instagram.com/chirayu_dodiya/", linkedin: "https://www.linkedin.com/in/chirayu-dodiya-3a025a2aa/" },
    { name: "Siddh Shah", position: "Frontend Dev", image: "/siddh_ws.jpg", instagram: "https://www.instagram.com/siddhshah22?igsh=MWc4aTJkbWFxYWV4eg==", linkedin: "https://www.linkedin.com/in/siddh-shah-b03432321?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Chirag Katkoriya", position: "Frontend Dev", image: "/chirag_ws.jpg", instagram: "https://www.instagram.com/katkoriyachirag/", linkedin: "https://www.linkedin.com/in/chirag-katkoriya/" },
    { name: "Pushkar Patel", position: "Frontend Dev", image: "/pushkar_ws.jpeg", instagram: "https://www.instagram.com/synapsedaiict?igsh=MTM4Mzk2NHNya3N1dA==", linkedin: "https://www.linkedin.com/in/pushkar-patel-409196295/?originalSubdomain=sg" },
    { name: "Priyanshi Chauhan", position: "Design and UX/UI", image: "/priyanshi_ws.png", instagram: "https://www.instagram.com/priyaanshii.5?igsh=MWIxbzNiM3Fxb3d4cg==", linkedin: "https://www.linkedin.com/in/priyanshichauhan01" },
    { name: "Yash Gangwani", position: "Frontend Dev", image: "/yash_ws.png", instagram: "https://www.instagram.com/gudda_786_?igsh=M2EwYWx3MWg4Mm53", linkedin: "https://www.linkedin.com/in/yash-gangwani" },
    { name: "Heer Mehta", position: "Frontend Dev", image: "/heer_ws.jpg", instagram: "https://www.instagram.com/heermehta0919/", linkedin: "https://www.linkedin.com/in/heer-mehta-14833928b/" },

  ]

  const navSections = [
    { id: "leadership", label: "Leadership" },
    { id: "heads", label: "Heads" },
    { id: "core", label: "Core Team" },
    { id: "mentors", label: "Mentors" },
    { id: "web", label: "Web Dev" },
  ]

  return (
    <main className="w-full bg-black min-h-screen overflow-x-hidden">
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      {/* Quick Navigation */}
      <QuickNav sections={navSections} />

      {/* Hero Section with Parallax */}
      <div ref={heroRef} className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
        <Image
          src="/teams_header.png"
          alt="Teams Header"
          fill
          priority
          className="object-cover object-center scale-110"
          sizes="100vw"
        />
        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        
        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="font-joker text-white text-6xl md:text-8xl lg:text-9xl tracking-wider
                         drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
            Our Team 
          </h1>
          <p className="mt-4 text-gray-300 font-roboto text-sm md:text-base tracking-widest uppercase">
            The people behind the magic
          </p>
        </div>

        {/* Scroll indicator */}
        <div 
          ref={scrollIndicatorRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60"
        >
          <span className="text-xs font-roboto tracking-wider uppercase">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {/* Leadership Section - Convenor & Deputy */}
      <section id="leadership" className="w-full py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-black via-gray-950 to-black">
        <div className="max-w-5xl mx-auto">
          <SectionTitle 
            title="leadership" 
            subtitle="Guiding Synapse' 26 to new heights"
          />
          <div className="flex flex-wrap justify-center gap-12 md:gap-20">
            {leadershipTeam.map((member, idx) => (
              <div key={`leader-${idx}`} className="transform md:scale-110">
                <TeamMemberCard member={member} index={idx} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heads Section */}
      <section id="heads" className="w-full bg-black">
        <TeamSection 
          title="department heads" 
          members={headsTeam}
          subtitle="Leading their teams with vision and dedication"
          layout="featured"
        />
      </section>

      {/* Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

      {/* Core Team Section */}
      <section id="core" className="w-full bg-gradient-to-b from-black to-gray-950">
        <TeamSection 
          title="core team" 
          members={coreTeam}
          subtitle="The backbone of every event"
          layout="default"
        />
      </section>

      {/* Mentors Section */}
      <section id="mentors" className="w-full bg-gradient-to-b from-gray-950 to-black">
        <TeamSection 
          title="mentors" 
          members={mentorsTeam}
          subtitle="Experience guiding excellence"
          layout="default"
        />
      </section>

      {/* Separator */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />

      {/* Web Development Team Section */}
      <section id="web" className="w-full bg-gradient-to-b from-black to-gray-950">
        <TeamSection 
          title="web development team" 
          members={webTeam}
          subtitle="Building the digital experience"
          layout="default"
        />
      </section>

      {/* Bottom spacing with subtle pattern */}
      <div className="h-16 md:h-24 bg-gradient-to-b from-gray-950 to-black" />
      
      <Footer />
    </main>
  )
}
