// app/events/[slug]/eventContent.ts

export type EventFee = {
  type: "solo" | "duet" | "group";
  price: number;
  min_members: number;
  max_members: number;
  // Optional specific metadata for this fee type
  date?: string;
  time?: string;
  venue?: string;
  // Optional fields for database integration
  fee_id?: number;
  qr_url?: string;
  event_id?: number;
};

export type EventCard = {
  image: string;
  name: string;
  description: string[];
  // Deprecated string price, keeping for now or replacing usage
  price: string;
  rules?: string[];
  rulebook: string; // URL
  fees: EventFee[];
  // Fallback metadata if not in fees
  date?: string;
  time?: string;
  venue?: string;
};

export type EventPageConfig = {
  title: string;
  cards: EventCard[];
};

export const EVENT_PAGES: Record<string, EventPageConfig> = {
  /* ================= DANCE ================= */
  dance: {
    title: "dance event",
    cards: [
      {
        image: "/images_events/dance/1.png",
        name: "Footloose",
        description: [
          "An expressive dance event blending rhythm, emotion, and storytelling.",
        ],
        price: "Entry fee: ₹300 per team",
        // Rules removed
        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk", // Placeholder or actual link
        fees: [
          { type: "group", price: 300, min_members: 2, max_members: 4, date: "26th Feb, 2026", time: "10:00 AM", venue: "OAT" },
          { type: "duet", price: 200, min_members: 2, max_members: 2, date: "26th Feb, 2026", time: "12:00 PM", venue: "OAT" }
        ],
      },
      {
        image: "/images_events/dance/2.png",
        name: "Naach",
        description: [
          "A lyrical face-off testing flow, punchlines, and stage presence.",
        ],
        price: "Entry fee: ₹200 per participant",

        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk",
        fees: [
          { type: "solo", price: 200, min_members: 1, max_members: 1, date: "27th Feb, 2026", time: "11:00 AM", venue: "CEP" }
        ],
      },
      {
        image: "/images_events/dance/3.png",
        name: "Showdown",
        description: ["High-energy DJ and freestyle dance showdown."],
        price: "Entry fee: ₹250 per participant",

        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk",
        fees: [
          { type: "solo", price: 250, min_members: 1, max_members: 1, date: "28th Feb, 2026", time: "05:00 PM", venue: "OAT" },
          { type: "duet", price: 400, min_members: 2, max_members: 2, date: "28th Feb, 2026", time: "07:00 PM", venue: "OAT" }
        ],
      },
    ],
  },

  /* ================= MUSIC ================= */
  music: {
    title: "music event",
    cards: [
      {
        image: "/images_events/music/1.png",
        name: "Battle of Bands",
        description: ["Bands compete with original compositions and covers."],
        price: "Entry fee: ₹500 per band",

        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk",
        fees: [
          { type: "group", price: 500, min_members: 3, max_members: 6, date: "26th Feb, 2026", time: "06:00 PM", venue: "OAT" },
          { type: "solo", price: 150, min_members: 1, max_members: 1, date: "26th Feb, 2026", time: "04:00 PM", venue: "OAT" }
        ],
      },
      {
        image: "/images_events/music/2.png",
        name: "Rave Knight",
        description: ["Electronic music, DJing, and live crowd control."],
        price: "Entry fee: ₹300 per participant",

        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk",
        fees: [
          { type: "solo", price: 300, min_members: 1, max_members: 1, date: "27th Feb, 2026", time: "09:00 PM", venue: "Cafeteria" }
        ],
      },
    ],
  },

  /* ================= FASHION ================= */
  fashion: {
    title: "fashion event",
    cards: [
      {
        image: "/images_events/fashion/1.png",
        name: "Rampage",
        description: [
          "Lights, camera, fashion! Designers showcase their creativity on the runway.",
        ],
        price: "Entry fee: ₹300 per team",

        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk",
        fees: [
          { type: "group", price: 300, min_members: 2, max_members: 4, date: "28th Feb, 2026", time: "08:00 PM", venue: "OAT" }
        ],
      },
      {
        image: "/images_events/fashion/2.png",
        name: "CosCon",
        description: [
          "Cosplay event featuring characters from anime, Bollywood, and Hollywood.",
        ],
        price: "Entry fee: ₹250 per participant",

        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk",
        fees: [
          { type: "solo", price: 250, min_members: 1, max_members: 1, date: "27th Feb, 2026", time: "02:00 PM", venue: "LT-1" }
        ],
      },
    ],
  },

  /* ================= THEATRE ================= */
  theatre: {
    title: "theatre event",
    cards: [
      {
        image: "/images_events/theatre/1.png",
        name: "Stage Play",
        description: [
          "A full-length theatrical performance judged on storytelling and acting.",
        ],
        price: "Entry fee: ₹400 per team",

        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk",
        fees: [
          { type: "group", price: 400, min_members: 4, max_members: 8, date: "26th Feb, 2026", time: "04:00 PM", venue: "OAT" }
        ],
      },
      {
        image: "/images_events/theatre/2.png",
        name: "Nukkad Natak",
        description: ["Street play with strong social messaging."],
        price: "Entry fee: ₹300 per team",

        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk",
        fees: [
          { type: "group", price: 300, min_members: 1, max_members: 10, date: "27th Feb, 2026", time: "05:00 PM", venue: "Cafeteria" }
        ],
      },
    ],
  },

  /* ================= GAMING ================= */
  gaming: {
    title: "gaming event",
    cards: [
      {
        image: "/images_events/gaming/1.png",
        name: "Battledrome",
        description: ["Competitive tactical FPS tournament."],
        price: "Entry fee: ₹500 per team",

        rulebook: "https://docs.google.com/document/d/1zo3Cqd1jtG_KNKgIZ6OCSu2CPAZNV2WWh7HQqFgTeDQ/edit?usp=drivesdk",
        fees: [
          { type: "group", price: 500, min_members: 5, max_members: 5, date: "28th Feb, 2026", time: "10:00 AM", venue: "Lab-1" }
        ],
      },
    ],
  },
};
