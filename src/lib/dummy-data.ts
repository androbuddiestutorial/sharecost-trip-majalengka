export const DUMMY_DESTINATIONS = [
  {
    id: "1",
    name: "Gunung Ciremai",
    location: "Kuningan / Majalengka",
    elevation: "3,078 mdpl",
    difficulty: "Sulit",
    duration: "2H 1M",
    price: 350000,
    image: "https://images.unsplash.com/photo-1549880338-65dd4bd82f28?q=80&w=800&auto=format&fit=crop",
    slug: "gunung-ciremai"
  },
  {
    id: "2",
    name: "Gunung Slamet",
    location: "Jawa Tengah",
    elevation: "3,432 mdpl",
    difficulty: "Sangat Sulit",
    duration: "3H 2M",
    price: 450000,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop",
    slug: "gunung-slamet"
  },
  {
    id: "3",
    name: "Gunung Sindoro",
    location: "Temanggung",
    elevation: "3,136 mdpl",
    difficulty: "Menengah",
    duration: "2H 1M",
    price: 400000,
    image: "https://images.unsplash.com/photo-1627883907446-0b19280b5be8?q=80&w=800&auto=format&fit=crop",
    slug: "gunung-sindoro"
  }
];

export const DUMMY_TRIPS = [
  {
    id: "t1",
    destination: "Gunung Ciremai",
    date: "25 Oct 2026",
    meetingPoint: "Majalengka",
    duration: "2H 1M",
    price: 350000,
    quotaTotal: 15,
    quotaFilled: 10,
    status: "OPEN",
    slug: "ciremai-25-oct-2026"
  },
  {
    id: "t2",
    destination: "Gunung Slamet",
    date: "01 Nov 2026",
    meetingPoint: "Basecamp Bambangan",
    duration: "3H 2M",
    price: 450000,
    quotaTotal: 12,
    quotaFilled: 12,
    status: "FULL",
    slug: "slamet-01-nov-2026"
  },
  {
    id: "t3",
    destination: "Gunung Sindoro",
    date: "15 Nov 2026",
    meetingPoint: "Basecamp Kledung",
    duration: "2H 1M",
    price: 400000,
    quotaTotal: 15,
    quotaFilled: 5,
    status: "OPEN",
    slug: "sindoro-15-nov-2026"
  }
];
