"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateShippingZoneAction } from "@/lib/actions/admin/settings";

export function ShippingZoneRow({
  zone,
}: {
  zone: {
    id: string;
    governorate: string;
    baseFee: number;
    expressFee: number | null;
    freeThreshold: number | null;
    etaMinDays: number;
    etaMaxDays: number;
  };
}) {
  const router = useRouter();
  const [baseFee, setBaseFee] = React.useState(String(zone.baseFee));
  const [expressFee, setExpressFee] = React.useState(zone.expressFee != null ? String(zone.expressFee) : "");
  const [freeThreshold, setFreeThreshold] = React.useState(
    zone.freeThreshold != null ? String(zone.freeThreshold) : "",
  );
  const [isPending, startTransition] = React.useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateShippingZoneAction({
        zoneId: zone.id,
        baseFee: Number(baseFee),
        expressFee: expressFee ? Number(expressFee) : undefined,
        freeThreshold: freeThreshold ? Number(freeThreshold) : undefined,
      });
      if (result.ok) {
        toast.success("تم تحديث رسوم الشحن");
        router.refresh();
      } else {
        toast.error("حدث خطأ ما");
      }
    });
  }

  return (
    <tr>
      <td className="px-4 py-3 font-medium">{zone.governorate}</td>
      <td className="px-4 py-3">
        <Input
          type="number"
          value={baseFee}
          onChange={(e) => setBaseFee(e.target.value)}
          className="h-9 w-28"
        />
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          value={expressFee}
          onChange={(e) => setExpressFee(e.target.value)}
          placeholder="—"
          className="h-9 w-28"
        />
      </td>
      <td className="px-4 py-3">
        <Input
          type="number"
          value={freeThreshold}
          onChange={(e) => setFreeThreshold(e.target.value)}
          placeholder="—"
          className="h-9 w-32"
        />
      </td>
      <td className="px-4 py-3 text-muted-foreground">
        {zone.etaMinDays}–{zone.etaMaxDays} يوم
      </td>
      <td className="px-4 py-3">
        <Button size="sm" variant="outline" disabled={isPending} onClick={handleSave}>
          {isPending ? "جارٍ الحفظ..." : "حفظ"}
        </Button>
      </td>
    </tr>
  );
}
