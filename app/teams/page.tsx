"use client"

import Image from "next/image"
import Footer from "@/components/ui/Footer"
import { Linkedin, Instagram } from "lucide-react"
import NavigationPanel from "@/components/ui/NavigationPanel"
import { Navbar } from "@/components/ui/Resizable-navbar"

type TeamMember = { 
  name: string; 
  position: string; 
  image: string;
  instagram?: string;
  linkedin?: string;
}

const TeamMemberCard = ({ member }: { member: TeamMember }) => (
  <div className="flex flex-col items-center">
    {/* UPDATE: Increased size to w-36 (mobile) and w-52 (desktop) */}
    <div className="w-36 h-36 md:w-52 md:h-52 bg-white rounded-sm mb-3 md:mb-4 overflow-hidden">
      <Image
        src={member.image || "/Synapse Logo.png"}
        alt={member.name}
        // UPDATE: Increased resolution to match new size
        width={500}
        height={500}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="text-center w-full px-1">
      <h3 className="font-roboto text-white text-sm md:text-lg leading-tight break-words">{member.name}</h3>
      <p className="font-roboto text-gray-400 text-xs md:text-sm mt-1">{member.position}</p>

      <div className="flex gap-2 justify-center mt-2">
        <a 
          href={member.instagram || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-gray-400 transition"
        >
          <Instagram className="w-4 h-4 md:w-[18px] md:h-[18px]" />
        </a>

        <a 
          href={member.linkedin || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-gray-400 transition"
        >
          <Linkedin className="w-4 h-4 md:w-[18px] md:h-[18px]" />
        </a>
      </div>
    </div>
  </div>
)

const TeamSection = ({ title, members }: { title: string; members: TeamMember[] }) => (
  <section className="w-full py-16 px-4 md:px-8 flex flex-col items-center">
    <h2 className="font-joker text-white text-3xl border border-gray-500 px-6 py-3 mb-12 text-center">
      {title}
    </h2>

    {members.length === 1 ? (
      <div className="flex justify-center w-full">
        <TeamMemberCard member={members[0]} />
      </div>
    ) : (
      <div
        className="flex flex-wrap justify-center gap-6 md:gap-12 w-full max-w-6xl"
      >
        {members.map((member, idx) => (
          <div key={idx} className="w-[calc(50%-12px)] sm:w-[calc(50%-24px)] md:w-[calc(33.33%-32px)] lg:w-[calc(25%-36px)] flex justify-center">
             <TeamMemberCard member={member} />
          </div>
        ))}
      </div>
    )}
  </section>
)

export default function TeamPage() {
  const designTeam: TeamMember[] = [
    { 
      name: "Priyanshi Chauhan", 
      position: "UI/UX Designer", 
      image: "/priyanshi_ws.png",
      instagram: "https://www.instagram.com/priyaanshii.5?igsh=MWIxbzNiM3Fxb3d4cg==",
      linkedin: "https://www.linkedin.com/in/priyanshichauhan01"
    },
  ]

  const mainTeamMembers: TeamMember[] = [
    { name: "Om Santoki", position: "Convenor", image: "/om_conv.jpg", instagram: "https://www.instagram.com/om_santoki?igsh=MWpzNm92YWI5Nzh4NA==", linkedin: "https://in.linkedin.com/in/omsantoki" },
    { name: "Sujal Mohapatra", position: "Deputy Convenor", image: "/sujal_dyconv.jpg", instagram: "https://www.instagram.com/sujal.__.mohapatra?igsh=aTRjbHk2djhlcXEx", linkedin: "https://www.linkedin.com/in/sujal-mohapatra-1319a6289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Pratham Lakhani", position: "Public Relations Head", image: "/Pratham_3r.JPG", instagram: "https://www.instagram.com/pratham._.lakhani_911?igsh=MWQ1bXBhZ2t2c3Yxeg==", linkedin: "https://www.linkedin.com/in/pratham-lakhani-1a16051b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Rujal Jiyani", position: "Events Head", image: "/rujal_3r.jpg", instagram: "https://www.instagram.com/rujal.jiyani?igsh=MjZicDh5MzRvdHI=", linkedin: "https://www.linkedin.com/in/rujal-jiyani9?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Namra Sanandiya", position: "PR head", image: "/namra_3r.jpeg", instagram: "https://www.instagram.com/oyy_namra?igsh=MXRrM3N6bWhxM2VrNA==", linkedin: "https://www.linkedin.com/in/namra-sanandiya-146673284?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Kosha Dalsaniya", position: "Events Head", image: "/kosha_3r.jpeg", instagram: "https://www.instagram.com/_kd1123_?igsh=dzl6bnhlcWNhcGZu&utm_source=qr", linkedin: "https://www.linkedin.com/in/kosha-dalsaniya-1478702b5?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
  ]

  const coreTeam: TeamMember[] = [
    { name: "Krish Paghadar", position: "Hospitality", image: "/krish_2n.jpg", instagram: "https://www.instagram.com/the_real_krrish?igsh=MXY4MWQ0ejBzbHVibQ==", linkedin: "https://www.linkedin.com/in/krish-paghadar-33b3a0326?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Ved Dhanani", position: "Events", image: "/ved_2n.jpg", instagram: "https://www.instagram.com/ved_dhananii?igsh=NmRoMDdkZ3N0cHdj&utm_source=qr", linkedin: "https://www.linkedin.com/in/ved-dhanani-18612631a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Heet Shah", position: "PR and Website Team", image: "/heet_2n.jpg", instagram: "https://www.instagram.com/heet._.shahh?igsh=MXh5MWtxMmh4b3F4Zg==", linkedin: "https://www.linkedin.com/in/heet-shah-468b60331?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Utsav Darji ", position: "Hospitality ", image: "/utsav_2n.jpg", instagram: "https://www.instagram.com/utsav_d06?igsh=MTk3bzhyMTUzdTBtZw%3D%3D&utm_source=qr", linkedin: "https://www.linkedin.com/in/utsav-darji-50a68b33a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Kevin Rank", position: "PR", image: "/kevin_2n.jpg", instagram: "https://www.instagram.com/kevinn.r97?igsh=MXdiM2ZxMXNzZTFoZQ==", linkedin: "https://www.linkedin.com/in/kevin-rank-ab9384330?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Dev Sanghani", position: "Event production , on call", image: "/dev_s_2n.jpg", instagram: "https://www.instagram.com/devvvv__2?igsh=MW9ibnFoOGV2cjk5Zg%3D%3D&utm_source=qr", linkedin: "https://www.linkedin.com/in/dev-sanghani-58b951321/" },
    { name: "Keval Shah", position: "Events", image: "/keval_2n.jpg", instagram: "https://www.instagram.com/kevalshah159?igsh=aHpjd2htdXZmNXZu", linkedin: "https://www.linkedin.com/in/keval-shah-899a7a321?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { name: "Jay Trivedi", position: "Event, CD", image: "/jay_2n.jpeg", instagram: "https://www.instagram.com/_jaytrivedi_18/", linkedin: "https://www.linkedin.com/in/jaytrivedi18/" },
    { name: "Dev Thakkar", position: "Production ", image: "/dev_t_2n.jpeg", instagram: "https://www.instagram.com/devvv.0103?igsh=MXd2YTcyaDlrOHM4eA%3D%3D&utm_source=qr", linkedin: "https://www.linkedin.com/in/dev-thakkar-5a73572aa?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
    { name: "Devamm Patel", position: "Mentor", image: "/Devamm.png", instagram: "https://www.instagram.com/_devamm_12/", linkedin: "https://in.linkedin.com/in/devamm-patel-197891265" },
    { name: "Harshali Dharmik", position: "Mentor", image: "/Harshali_img.jpg", instagram: "https://www.instagram.com/harshali__2074/", linkedin: "https://in.linkedin.com/in/harshali-dharmik-a640b3284" },
    { name: "Vivek Chaudhari", position: "Mentor", image: "/Vivek_img.jpeg", instagram: "https://www.instagram.com/vivek.chaudhari_30/", linkedin: "https://in.linkedin.com/in/vivek-kirankumar-chaudhari" },
    { name: "Dev Wadhvani", position: "Mentor", image: "/Dev_img.jpeg", instagram: "https://www.instagram.com/devwadhvani/", linkedin: "https://in.linkedin.com/in/devwadhvani" },
    { name: "Sujal Manavadariya", position: "Mentor", image: "/Sujal_img.png", instagram: "https://www.instagram.com/_sujalmanavadariya_/", linkedin: "https://in.linkedin.com/in/sujal-manavadariya-499992252" },
    { name: "Rishabh Jain", position: "Mentor", image: "/Rishabh_img.jpg", instagram: "https://www.instagram.com/rishabhjain_149/", linkedin: "https://in.linkedin.com/in/jainrishabh04" },
    { name: "Siddhant Gupta", position: "Mentor", image: "/Siddhant_img.jpeg", instagram: "https://www.instagram.com/siddhant_g86/", linkedin: "https://in.linkedin.com/in/siddhant-gupta-6327b4253" },
    { name: "Bhavya Shah", position: "Mentor", image: "/Bhavya_img.jpg", instagram: "https://www.instagram.com/bhavya_1918?igsh=b29ieW1oMTBtamhi&utm_source=qr", linkedin: "https://www.linkedin.com/in/bhavya3604?utm_source=share_via&utm_content=profile&utm_medium=member_ios" },
    { name: "Adhiraj Roy Chowdhury ", position: "Mentor", image: "/Adhiraj_img.jpg", instagram: "https://www.instagram.com/adhirajrc?igsh=MWUyNDIxNTdic3Zmbg==", linkedin: "https://www.linkedin.com/in/adhiraj-roy-chowdhury" },
    { name: "Kashish Khubchandani", position: "Mentor", image: "/Kashish_img.jpg", instagram: "https://www.instagram.com/_cutest_stranger/", linkedin: "http://www.linkedin.com/in/kashish-khubchandani-281b97235" },
  ]


  const webTeam: TeamMember[] = [
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
    <main className="w-full bg-black min-h-screen">
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      {/* HEADER IMAGE */}
      <div className="relative w-full h-[65vh] min-h-[450px] overflow-hidden z-0">
        <Image
          src="/teams_header.png"
          alt="Teams Header"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black" />
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

      <div className="h-20" />
      <Footer />
    </main>
  )
}
