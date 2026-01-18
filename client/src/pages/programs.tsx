import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, Users, Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import type { Program } from "@shared/schema";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function Programs() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
  });

  const activePrograms = programs
    .filter(p => p.isActive)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  const filteredPrograms = activePrograms.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/20 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-programs-title">
                Our Programs
              </h1>
              <p className="text-muted-foreground">
                Join our structured programs for ongoing learning and community engagement
              </p>
              <div className="relative max-w-md mx-auto pt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground mt-2" />
                <Input
                  type="search"
                  placeholder="Search programs..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-programs"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-full mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-10 bg-muted rounded mt-4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map((program) => {
                  const spotsLeft = program.capacity - program.registeredCount;
                  const fillPercentage = (program.registeredCount / program.capacity) * 100;
                  
                  return (
                    <Card key={program.id} className="h-full hover-elevate transition-all duration-200 flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle data-testid={`text-program-name-${program.id}`}>
                            {program.name}
                          </CardTitle>
                          <Badge variant="secondary">${program.price}</Badge>
                        </div>
                        <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(program.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{program.schedule}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              Enrollment
                            </span>
                            <span className="font-medium">{program.registeredCount} / {program.capacity}</span>
                          </div>
                          <Progress value={fillPercentage} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">
                            {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} remaining
                          </p>
                        </div>

                        <Link href={`/register?program=${program.id}`}>
                          <Button 
                            className="w-full" 
                            disabled={spotsLeft <= 0}
                            data-testid={`button-register-program-${program.id}`}
                          >
                            {spotsLeft > 0 ? "Register Now" : "Program Full"}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center max-w-md mx-auto">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No programs found" : "No active programs"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? "Try adjusting your search terms"
                    : "Check back soon for new programs!"
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                    data-testid="button-clear-search"
                  >
                    Clear Search
                  </Button>
                )}
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
