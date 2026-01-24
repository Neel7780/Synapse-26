export type EventItem = {
    slug: string;
    title: string;
    cover: string;
};

export const EVENTS: EventItem[] = [
    { slug: "dance", title: "DANCE EVENT", cover: "/images_events/dance.png" },
    {
        slug: "fashion",
        title: "Fashion Show",
        cover: "/images_events/fashionshow.png",
    },
    { slug: "music", title: "MUSIC EVENT", cover: "/images_events/music.png" },
    {
        slug: "theatre",
        title: "THEATRE SHOW",
        cover: "/images_events/theatre.png",
    },
    { slug: "gaming", title: "GAMING EVENT", cover: "/images_events/gaming.png" },
];
