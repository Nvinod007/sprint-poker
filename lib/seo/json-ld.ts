import { getSiteUrl } from "@/lib/site-url";

const FAQ_ITEMS = [
  {
    question: "Is Sprint Poker free?",
    answer:
      "Yes. Sprint Poker is a free online planning poker tool. Create a room, share the code with your team, and start estimating story points — no login or credit card required.",
  },
  {
    question: "What is sprint poker?",
    answer:
      "Sprint poker (also called planning poker) is an agile estimation technique where team members vote on story points using numbered cards. Sprint Poker runs this process online with real-time sync for remote and in-person teams.",
  },
  {
    question: "Do I need an account to use planning poker?",
    answer:
      "No. Sprint Poker works without signup. Enter a display name, create or join a room with a short code, and vote on Fibonacci cards (1, 2, 3, 5, 8, 13, 21, ?, ☕).",
  },
  {
    question: "How does online planning poker work?",
    answer:
      "One person creates a room and becomes the host. Teammates join with the room code, pick story-point cards privately, and the host reveals all votes at once to align on estimates.",
  },
] as const;

export function buildHomePageJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Sprint Poker",
        description:
          "Free online sprint poker and planning poker for agile teams.",
        inLanguage: "en-US",
      },
      {
        "@type": "WebApplication",
        "@id": `${siteUrl}/#app`,
        name: "Sprint Poker",
        alternateName: [
          "Free Sprint Poker",
          "Free Planning Poker",
          "Online Planning Poker",
          "Scrum Poker Online",
        ],
        url: siteUrl,
        isPartOf: { "@id": `${siteUrl}/#website` },
        applicationCategory: "BusinessApplication",
        applicationSubCategory: "Agile Estimation Tool",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        description:
          "Free sprint poker and planning poker for agile teams. Estimate user stories with Fibonacci cards in real time — no login required.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        featureList: [
          "Free planning poker with no signup",
          "Real-time Fibonacci story point voting",
          "Private rooms with shareable codes",
          "Host controls for reveal and new rounds",
          "Works for remote and in-person scrum teams",
        ],
        keywords: [
          "free sprint poker",
          "free planning poker",
          "online planning poker",
          "planning poker no login",
          "story pointing tool",
          "agile estimation",
          "scrum poker online",
          "fibonacci planning poker",
          "story points estimator",
          "remote sprint planning",
        ].join(", "),
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
