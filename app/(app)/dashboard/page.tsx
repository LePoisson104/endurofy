import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CreditCard, Activity } from "lucide-react";
import BarChart from "@/components/charts/bar-chart";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import LineChart from "@/components/charts/line-chart";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col p-[1rem]">
      {/* Main Content */}
      <main className="flex-1">
        <div className="flex flex-col space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col">
            <div className="text-2xl font-bold">Dashboard</div>
            <p className="text-sm text-muted-foreground">
              Jan 20, 2023 | 6:00 PM
            </p>
          </div>

          {/* Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-red-500">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Subscriptions
                </CardTitle>
                <Users className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+2350</div>
                <p className="text-xs text-green-500">
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <CreditCard className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-green-500">+19% from last month</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Now
                </CardTitle>
                <Activity className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-green-500">+201 since last hour</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Recent Sales */}
          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
            <Card className="col-span-4 shadow-sm">
              <BarChart />
            </Card>
            <Card className="col-span-4 shadow-sm">
              <LineChart />
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
            <Card className="col-span-4 shadow-sm">
              <BarChart />
            </Card>
            <Card className="col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle>Workout Sessions</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    From March 15, 2025 - March 21, 2025
                  </Button>
                </div>
              </CardHeader>
              <Separator />
              <CardContent>
                <div className="space-y-6">
                  {recentSales.map((log) => (
                    <div key={log.name} className="flex justify-between">
                      <div className=" w-3/10">
                        <p className="text-sm font-bold">{log.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.program}
                        </p>
                      </div>
                      <div className=" w-3/10">
                        <p className="text-sm text-muted-foreground">
                          {log.date}
                        </p>
                      </div>
                      <div className="w-3/10">
                        <Button>View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

const recentSales = [
  {
    name: "Push Asdfsddf",
    program: "5 day split",
    date: "March 15, 2025",
  },
  {
    name: "Pull A",
    program: "5 day split",
    date: "March 16, 2025",
  },
  {
    name: "Legs A",
    program: "5 day split",
    date: "March 17, 2025",
  },
  {
    name: "Push B",
    program: "5 day split",
    date: "March 18, 2025",
  },
  {
    name: "Pull B",
    program: "5 day split",
    date: "March 19, 2025",
  },
];
