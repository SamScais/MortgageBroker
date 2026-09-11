import { saveDb } from "../lib/store";
import { resetDemoData } from "../lib/seed-data";
import { DEMO_BROKER, DEMO_CASES } from "../lib/demo";
import { clientUploadUrl } from "../lib/paths";

const db = resetDemoData();
saveDb(db);

console.log("Seeded SAMPLE demo data.");
console.log(`Broker: ${DEMO_BROKER.email} / ${DEMO_BROKER.password}`);
console.log(`Purchase client link: ${clientUploadUrl(DEMO_CASES.purchase.token)}`);
console.log(`Refinance client link: ${clientUploadUrl(DEMO_CASES.refinance.token)}`);
