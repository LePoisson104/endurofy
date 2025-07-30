import { Skeleton } from "../ui/skeleton";

export default function FoodCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-full h-[55px]" />
      <Skeleton className="w-full h-[55px]" />
      <Skeleton className="w-full h-[55px]" />
      <Skeleton className="w-full h-[55px]" />
      <Skeleton className="w-full h-[55px]" />
      <Skeleton className="w-full h-[55px]" />
    </div>
  );
}
