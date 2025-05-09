import { CardHeader, CardContent } from "../ui/card";
import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";

export default function DashboardSkeleton() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xs:grid-cols-4">
        <div className="grid gap-4 md:grid-cols-2 sm:grid-cols-1">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-3 w-48 mb-1" />
              <Skeleton className="h-3 w-44" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Skeleton className="h-8 w-28 mb-2" />
                <Skeleton className="h-4 w-24 mt-2" />
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex justify-between mt-2">
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-10" />
              </div>
              <Skeleton className="h-3 w-36 mt-2" />
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex flex-col w-1/2">
                <Skeleton className="h-6 w-28 mb-1" />
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
              <div className="flex flex-col gap-2 w-1/2">
                <div className="flex gap-2">
                  <Skeleton className="w-[1px] h-5" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-[1px] h-5" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-[1px] h-5" />
                  <Skeleton className="h-4 w-22" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* workout sessions */}
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-36 mb-2" />
            <Skeleton className="h-9 w-44" />
          </CardHeader>
          <Separator />
          <CardContent className="h-[300px] overflow-y-auto">
            <div className="space-y-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}>
                  <div className="flex justify-between mb-5">
                    <div className="w-3/10">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="w-3/10 flex justify-center items-center">
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="w-3/10 flex justify-end">
                      <Skeleton className="h-9 w-16" />
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Sales */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-28 mb-1" />
            <Skeleton className="h-4 w-44" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex items-center gap-2 space-y-0 sm:flex-row">
            <div className="flex flex-col w-full gap-2">
              <Skeleton className="h-6 w-36 mb-1" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="h-10 w-[160px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[250px] w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
