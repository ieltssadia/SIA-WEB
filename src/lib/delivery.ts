/**
 * Delivery zones & pricing shared by the checkout UI and /api/orders.
 * Keep this file framework-free (plain TS) so both client and server can
 * import it without pulling React into the API route.
 */

export type DeliveryZone = {
  value: string;
  label: string;
  fee: number; // BDT
  courier: boolean; // courier zones need a street address
  note?: string;
};

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    value: "pickup",
    label: "Campus Pickup: Chowmuhona, Sreemangal",
    fee: 0,
    courier: false,
    note: "ক্যাম্পাস থেকে হাতে বুঝে নিন, সম্পূর্ণ ফ্রি",
  },
  {
    value: "sreemangal",
    label: "Sreemangal Home Delivery",
    fee: 0,
    courier: false,
    note: "শ্রীমঙ্গল শহরে ফ্রি হোম ডেলিভারি",
  },
  {
    value: "inside-dhaka",
    label: "Inside Dhaka: Courier",
    fee: 70,
    courier: true,
    note: "২-৩ কর্মদিবসে ডেলিভারি",
  },
  {
    value: "outside-dhaka",
    label: "Outside Dhaka: Courier (সারাদেশ)",
    fee: 130,
    courier: true,
    note: "৩-৫ কর্মদিবসে ডেলিভারি",
  },
];

/** Courier fee is waived at this cart subtotal (BDT) and above. */
export const FREE_COURIER_THRESHOLD = 2000;

export function getZone(value: string): DeliveryZone | undefined {
  return DELIVERY_ZONES.find((z) => z.value === value);
}

/** Delivery fee for a zone given the cart subtotal (courier free above threshold). */
export function deliveryFeeFor(zoneValue: string, subtotal: number): number {
  const zone = getZone(zoneValue);
  if (!zone || !zone.courier) return 0;
  return subtotal >= FREE_COURIER_THRESHOLD ? 0 : zone.fee;
}

export function zoneLabel(value: string): string {
  return getZone(value)?.label ?? value;
}

/** Manual send-money channels — the online gateway plugs in beside these later. */
export const PAYMENT_RECEIVER = {
  bkash: "01752-716238",
  nagad: "01752-716238",
  full: "01752716238",
};
