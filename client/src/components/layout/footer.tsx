import { Mail, MapPin, Phone } from "lucide-react";
import { Link } from "wouter";
import logoImage from "@assets/PHW_denverLogo1_transparent_1768667042398.png";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={logoImage} alt="Project Healing Waters" className="h-10 w-auto" />
              <span className="text-lg font-semibold">Project Healing Waters - DENVER</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Dedicated to the physical and emotional rehabilitation of disabled active military service personnel and veterans through fly fishing and outdoor activities.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Upcoming Events
              </Link>
              <Link href="/programs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Programs
              </Link>
              <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Register
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@eventhub.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>123 Event Street, City</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Hours</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Monday - Friday: 9am - 6pm</p>
              <p>Saturday: 10am - 4pm</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Project Healing Waters - Denver. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
