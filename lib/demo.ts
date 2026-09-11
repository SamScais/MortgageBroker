export const DEMO_BROKER = {
  id: "broker-demo-sam",
  email: "broker@demo.local",
  password: "DemoBroker1!",
  name: "Sam Wilson (SAMPLE broker)",
};

export const DEMO_CASES = {
  purchase: {
    id: "case-demo-purchase",
    token: "demo-purchase-priya",
    clientLabel: "SAMPLE Client — Priya Nair",
    clientEmail: "priya.nair@demo.local",
    clientMobile: "0400 000 111",
  },
  refinance: {
    id: "case-demo-refinance",
    token: "demo-refinance-tom",
    clientLabel: "SAMPLE Client — Tom Brennan",
    clientEmail: "tom.brennan@demo.local",
    clientMobile: "0400 000 222",
  },
} as const;
