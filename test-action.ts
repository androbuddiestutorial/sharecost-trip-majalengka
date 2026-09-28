import { searchBookingByCode } from "./src/app/(public)/pembayaran/actions";

async function test() {
  try {
    const result = await searchBookingByCode("BK-JCCHFCEM");
    console.log(result);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
