import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { StarRating } from "@/components/storefront/star-rating";
import { formatDate } from "@/lib/utils";

export interface ReviewData {
  id: string;
  rating: number;
  titleAr: string | null;
  titleEn: string | null;
  bodyAr: string | null;
  bodyEn: string | null;
  isVerified: boolean;
  createdAt: Date;
  user: { name: string };
}

export function ReviewList({ reviews }: { reviews: ReviewData[] }) {
  const t = useTranslations("product");
  const locale = useLocale() as "ar" | "en";

  if (reviews.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">{t("noReviews")}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {reviews.map((review) => {
        const title = locale === "ar" ? review.titleAr : review.titleEn;
        const body = locale === "ar" ? review.bodyAr : review.bodyEn;
        return (
          <div key={review.id} className="py-5 first:pt-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{review.user.name}</span>
                {review.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="size-3.5" />
                    {locale === "ar" ? "مشتري موثّق" : "Verified"}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDate(review.createdAt, locale)}
              </span>
            </div>
            <StarRating value={review.rating} showValue={false} className="mb-2" />
            {title && <p className="font-medium">{title}</p>}
            {body && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>}
          </div>
        );
      })}
    </div>
  );
}
