import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PageTitle from "@/components/global/page-title";

export default function Targets() {
  return (
    <div className="flex flex-col gap-[1rem]">
      <div className="mb-4">
        <PageTitle
          title="Targets"
          showCurrentDateAndTime={false}
          subTitle={`Last updated: ${new Date().toLocaleDateString()}`}
        />
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>
              <h1>Targets</h1>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
