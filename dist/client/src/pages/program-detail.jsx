import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Users, ArrowLeft, Navigation, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
export default function ProgramDetail() {
    var id = useParams().id;
    var _a = useQuery({
        queryKey: ["/api/programs", id],
    }), program = _a.data, isLoading = _a.isLoading, error = _a.error;
    return (<div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link href="/programs">
            <Button variant="ghost" className="mb-6" data-testid="button-back-programs">
              <ArrowLeft className="mr-2 h-4 w-4"/>
              Back to Programs
            </Button>
          </Link>

          {isLoading ? (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="animate-pulse">
                  <div className="h-64 bg-muted rounded-t-lg"/>
                  <CardHeader>
                    <div className="h-8 bg-muted rounded w-3/4"/>
                    <div className="h-4 bg-muted rounded w-full mt-4"/>
                    <div className="h-4 bg-muted rounded w-2/3 mt-2"/>
                  </CardHeader>
                </Card>
              </div>
              <div>
                <Card className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-1/2"/>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-10 bg-muted rounded"/>
                    <div className="h-10 bg-muted rounded"/>
                  </CardContent>
                </Card>
              </div>
            </div>) : error || !program ? (<Card className="p-12 text-center max-w-md mx-auto">
              <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
              <h3 className="text-lg font-semibold mb-2">Program not found</h3>
              <p className="text-muted-foreground mb-4">
                The program you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/programs">
                <Button data-testid="button-browse-programs">Browse Programs</Button>
              </Link>
            </Card>) : (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  {program.imageUrl ? (<div className="h-64 rounded-t-lg overflow-hidden flex items-center justify-center bg-black/5">
                      <div className="flex items-center justify-center h-full w-full bg-white" style={{ minHeight: 256 }}>
                        <img src={program.imageUrl} alt={program.name} style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    display: "block",
                }}/>
                      </div>
                    </div>) : (<div className="h-64 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-t-lg flex items-center justify-center">
                      <Navigation className="h-24 w-24 text-blue-400/40"/>
                    </div>)}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <CardTitle className="text-2xl md:text-3xl" data-testid="text-program-title">
                          {program.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {formatDate(program.startDate)} - {formatDate(program.endDate)}
                        </CardDescription>
                      </div>
                      <Badge variant={program.isActive ? "default" : "secondary"}>
                        {program.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">About This Program</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap" data-testid="text-program-description">
                        {program.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-medium">{formatDate(program.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-medium">{formatDate(program.endDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Users className="h-5 w-5 text-primary"/>
                        <div>
                          <p className="text-sm text-muted-foreground">Capacity</p>
                          <p className="font-medium">{program.registeredCount} / {program.capacity}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Registration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="font-medium">{program.registeredCount} / {program.capacity}</span>
                      </div>
                      <div className="h-2 rounded bg-muted overflow-hidden">
                        <div className="h-2 rounded bg-primary" style={{ width: "".concat((program.registeredCount / program.capacity) * 100, "%") }}/>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      <Users className="h-5 w-5 text-primary"/>
                      <div>
                        <p className="font-medium text-primary">{program.capacity - program.registeredCount} spots remaining</p>
                        <p className="text-sm text-muted-foreground">
                          {(program.registeredCount / program.capacity) * 100 > 80 ? "Filling up fast!" : "Spots available"}
                        </p>
                      </div>
                    </div>
                    {program.capacity - program.registeredCount > 0 ? (<Link href={"/register?program=".concat(program.id)}>
                        <Button className="w-full" size="lg" data-testid="button-register-program">
                          Register for This Program
                        </Button>
                      </Link>) : (<Button className="w-full" size="lg" disabled>
                        Program Full
                      </Button>)}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What to Expect</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5"/>
                        <span className="text-sm">Easy online registration</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5"/>
                        <span className="text-sm">Confirmation email sent immediately</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5"/>
                        <span className="text-sm">Reminder before the program</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>)}
        </div>
      </main>
      <Footer />
    </div>);
}
