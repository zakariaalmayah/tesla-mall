import "server-only";
import { prisma } from "@/lib/prisma";

export async function getActiveShippingZones() {
  const zones = await prisma.shippingZone.findMany({
    where: { isActive: true },
    orderBy: { governorate: "asc" },
    select: {
      governorate: true,
      city: true,
      baseFee: true,
      expressFee: true,
      freeThreshold: true,
      etaMinDays: true,
      etaMaxDays: true,
    },
  });

  return zones.map((zone) => ({
    governorate: zone.governorate,
    city: zone.city,
    baseFee: Number(zone.baseFee),
    expressFee: zone.expressFee != null ? Number(zone.expressFee) : null,
    freeThreshold: zone.freeThreshold != null ? Number(zone.freeThreshold) : null,
    etaMinDays: zone.etaMinDays,
    etaMaxDays: zone.etaMaxDays,
  }));
}

export async function getShippingZoneForGovernorate(governorate: string) {
  const zone = await prisma.shippingZone.findFirst({
    where: { governorate, isActive: true },
    orderBy: { city: "asc" },
  });
  if (!zone) return null;
  return {
    governorate: zone.governorate,
    city: zone.city,
    baseFee: Number(zone.baseFee),
    expressFee: zone.expressFee != null ? Number(zone.expressFee) : null,
    freeThreshold: zone.freeThreshold != null ? Number(zone.freeThreshold) : null,
    etaMinDays: zone.etaMinDays,
    etaMaxDays: zone.etaMaxDays,
  };
}

export async function getAllShippingZonesAdmin() {
  const zones = await prisma.shippingZone.findMany({
    orderBy: { governorate: "asc" },
  });
  return zones.map((zone) => ({
    id: zone.id,
    governorate: zone.governorate,
    city: zone.city,
    baseFee: Number(zone.baseFee),
    expressFee: zone.expressFee != null ? Number(zone.expressFee) : null,
    freeThreshold: zone.freeThreshold != null ? Number(zone.freeThreshold) : null,
    etaMinDays: zone.etaMinDays,
    etaMaxDays: zone.etaMaxDays,
    isActive: zone.isActive,
  }));
}

export async function getUserAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}
