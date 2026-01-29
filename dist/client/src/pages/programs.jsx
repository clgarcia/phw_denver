import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Calendar, Clock, Users, Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
// Programs page displays a list of available programs with search functionality
// Format a date string into a readable format (e.g., January 1, 2026)
function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
// Main component for displaying and searching programs
export default function Programs() {
    // State for search input
    var _a = useState(""), searchTerm = _a[0], setSearchTerm = _a[1];
    // Fetch programs data from API
    var _b = useQuery({
        queryKey: ["/api/programs"],
    }), _c = _b.data, programs = _c === void 0 ? [] : _c, isLoading = _b.isLoading;
    // Filter and sort only active programs by start date
    var activePrograms = programs
        .filter(function (p) { return p.isActive; })
        .sort(function (a, b) { return new Date(a.startDate).getTime() - new Date(b.startDate).getTime(); });
    // Filter programs based on search term (name or description)
    var filteredPrograms = activePrograms.filter(function (program) {
        return program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            program.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
    // Render programs page layout
    return (<div className="min-h-screen flex flex-col">
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
              {/* Search input for filtering programs */}
              <div className="relative max-w-md mx-auto pt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground mt-2"/>
                <Input type="search" placeholder="Search programs..." className="pl-10" value={searchTerm} onChange={function (e) { return setSearchTerm(e.target.value); }} data-testid="input-search-programs"/>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(function (i) { return (<Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"/>
                      <div className="h-4 bg-muted rounded w-full mt-2"/>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded w-full mb-2"/>
                      <div className="h-4 bg-muted rounded w-2/3"/>
                      <div className="h-10 bg-muted rounded mt-4"/>
                    </CardContent>
                  </Card>); })}
              </div>) : filteredPrograms.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map(function (program) { return (<Link key={program.id} href={"/programs/".concat(program.id)}>
                    <Card className="group h-full hover-elevate cursor-pointer transition-all duration-200">
                      {program.imageUrl ? (<div className="h-48 rounded-t-lg overflow-hidden flex items-center justify-center bg-black/5">
                          <div className="flex items-center justify-center h-full w-full bg-white" style={{ minHeight: 192 }}>
                            <img src={program.imageUrl} alt={program.name} style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        width: "auto",
                        height: "auto",
                        display: "block",
                    }}/>
                          </div>
                        </div>) : (<div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-primary/40"/>
                        </div>)}
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors" data-testid={"text-program-name-".concat(program.id)}>
                          {program.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">{program.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4"/>
                          <span>{formatDate(program.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4"/>
                          <span>{program.schedule}</span>
                        </div>
                        {/* Location field removed from Program type. If needed, add to schema and backend. */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-primary"/>
                            <span className="text-primary font-medium">
                              {program.capacity - program.registeredCount} spots left
                            </span>
                          </div>
                          <Button size="sm" variant="outline" data-testid={"button-view-program-".concat(program.id)}>
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>); })}
              </div>) : (<Card className="p-12 text-center max-w-md mx-auto">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "No programs found" : "No active programs"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm
                ? "Try adjusting your search terms"
                : "Check back soon for new programs!"}
                </p>
                {searchTerm && (<Button variant="outline" className="mt-4" onClick={function () { return setSearchTerm(""); }} data-testid="button-clear-search">
                    Clear Search
                  </Button>)}
              </Card>)}
          </div>
        </section>
      </main>

      <Footer />
    </div>);
}
