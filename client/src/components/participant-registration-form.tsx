import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// TODO: Add all fields from the participant registration schema
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];
const ETHNICITIES = [
  "American Indian or Alaskan Native",
  "Asian",
  "Black or African American",
  "Hispanic or Latino",
  "Native Hawaiian or Other Pacific Islander",
  "Caucasian",
  "Other"
];
const MILITARY_STATUSES = ["Active Duty", "Reserve/Guard", "Veteran", "Retired"];
const YES_NO = ["Yes", "No"];
const BRANCHES = [
  "Army","Air Force","Marine Corps","Navy","Coast Guard",
  "Army Reserve","Air Force Reserve","Marine Corps Reserve","Navy Reserve","Coast Guard Reserve",
  "Army National Guard","Air Force National Guard","Space Force","Space Force Reserve"
];
const DEPLOYMENTS = [
  "World War II","Korea","Cold War","Vietnam","Gulf War","Operation Iraqi Freedom",
  "Post 9/11 Afghanistan","Pre or Post 9/11","Post 9/11 Iraq","Operation Enduring Freedom","Other","N/A"
];

const participantSchema = z.object({
  // Section 1: Participant Contact Information
  firstName: z.string().min(1, "First name is required"),
  middleInitial: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  email: z.string().email("Invalid email address"),
  mobilePhone: z.string().min(1, "Mobile phone is required").regex(/^\d{3}-\d{3}-\d{4}$/, "Format: 555-555-5555"),
  workPhone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Format: 555-555-5555").or(z.literal("")).optional(),
  homePhone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Format: 555-555-5555").or(z.literal("")).optional(),
  preferredPhone: z.enum(["mobile", "home", "work"], { required_error: "Preferred phone is required" }),
  birthYear: z.string().regex(/^\d{4}$/, "Format: YYYY"),
  gender: z.string().min(1, "Gender is required"),
  ethnicity: z.enum([
    "American Indian or Alaskan Native",
    "Asian",
    "Black or African American",
    "Hispanic or Latino",
    "Native Hawaiian or Other Pacific Islander",
    "Caucasian",
    "Other"
  ], { required_error: "Ethnicity is required" }),
  // Section 2: Military Service Related
  militaryStatus: z.enum(["Active Duty", "Reserve/Guard", "Veteran", "Retired"], { required_error: "Status is required" }),
  isDisabledVeteran: z.enum(["Yes", "No"], { required_error: "Required" }),
  usesVA: z.enum(["Yes", "No"], { required_error: "Required" }),
  branchOfService: z.array(z.enum([
    "Army","Air Force","Marine Corps","Navy","Coast Guard",
    "Army Reserve","Air Force Reserve","Marine Corps Reserve","Navy Reserve","Coast Guard Reserve",
    "Army National Guard","Air Force National Guard","Space Force","Space Force Reserve"
  ])).min(1, "Select at least one branch"),
  deployments: z.array(z.enum([
    "World War II","Korea","Cold War","Vietnam","Gulf War","Operation Iraqi Freedom",
    "Post 9/11 Afghanistan","Pre or Post 9/11","Post 9/11 Iraq","Operation Enduring Freedom","Other","N/A"
  ])).min(1, "Select at least one deployment"),
  entryDate: z.string().optional(),
  rank: z.string().optional(),
  rankGrade: z.string().optional(),
  awards: z.string().optional(),
  conditions: z.string().optional(),
  // Section 3: Emergency Contact Information (to be added next)
  // ...existing fields...
  flyFishingLevel: z.string().min(1, "Required"),
  flyTyingLevel: z.string().min(1, "Required"),
  rodBuildingLevel: z.string().min(1, "Required"),
  flyCastingLevel: z.string().min(1, "Required"),
  handedness: z.string().optional(),
  retrieveHand: z.string().optional(),
  shirtSize: z.string().optional(),
  shoeSize: z.string().optional(),
  accessibility: z.string().optional(),
  additionalInfo: z.string().optional(),
  maritalStatus: z.string().optional(),
  education: z.string().optional(),
  employment: z.string().optional(),
  personalBio: z.string().optional(),
  photoUrl: z.string().optional(),
});

type ParticipantFormData = z.infer<typeof participantSchema>;

export function ParticipantRegistrationForm({ onSuccess }: { onSuccess?: () => void }) {
  const form = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: {},
  });

  const onSubmit = (data: ParticipantFormData) => {
    // TODO: Implement API call
    if (onSuccess) onSuccess();
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Participant Registration</CardTitle>
        <CardDescription>Fill out the form below to register as a participant.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Participant Contact Information */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Participant Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="middleInitial" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Initial</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="street" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select state..." /></SelectTrigger>
                        <SelectContent>
                          {US_STATES.map(state => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="postalCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="country" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="mobilePhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Phone <span className="text-xs text-muted-foreground">(e.g. 555-555-5555)</span></FormLabel>
                    <FormControl><Input {...field} placeholder="555-555-5555" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="workPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work Phone <span className="text-xs text-muted-foreground">(e.g. 555-555-5555)</span></FormLabel>
                    <FormControl><Input {...field} placeholder="555-555-5555" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="homePhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Home Phone <span className="text-xs text-muted-foreground">(e.g. 555-555-5555)</span></FormLabel>
                    <FormControl><Input {...field} placeholder="555-555-5555" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="preferredPhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Phone</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select preferred..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile">Mobile</SelectItem>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="work">Work</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="birthYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birth Year <span className="text-xs text-muted-foreground">(YYYY)</span></FormLabel>
                    <FormControl><Input {...field} placeholder="YYYY" maxLength={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="gender" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ethnicity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ethnicity</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select ethnicity..." /></SelectTrigger>
                        <SelectContent>
                          {ETHNICITIES.map(e => (
                            <SelectItem key={e} value={e}>{e}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>
            {/* Section 2: Military Service Related */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Military Service Related</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="militaryStatus" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select status..." /></SelectTrigger>
                        <SelectContent>
                          {MILITARY_STATUSES.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="isDisabledVeteran" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you a disabled veteran?</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="usesVA" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Are you currently utilizing or enrolled in VA medical services?</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {/* Side-by-side checkboxes for Branch and Deployments */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="branchOfService" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch of Military Service</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-1">
                          {BRANCHES.map(branch => (
                            <label key={branch} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.value?.includes(branch as typeof field.value[number]) || false}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  if (checked) {
                                    field.onChange([...(field.value || []), branch]);
                                  } else {
                                    field.onChange((field.value || []).filter((b: string) => b !== branch));
                                  }
                                }}
                              />
                              {branch}
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="deployments" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deployments and conflicts served in</FormLabel>
                      <FormControl>
                        <div className="flex flex-col gap-1">
                          {DEPLOYMENTS.map(dep => (
                            <label key={dep} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={field.value?.includes(dep as typeof field.value[number]) || false}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  if (checked) {
                                    field.onChange([...(field.value || []), dep]);
                                  } else {
                                    field.onChange((field.value || []).filter((d: string) => d !== dep));
                                  }
                                }}
                              />
                              {dep}
                            </label>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                {/* Removed: entryDate, rank, rankGrade, awards, conditions (to be added later as optional) */}
              </div>
            </div>
            {/* Section 3: Emergency Contact Information (to be implemented next) */}
            <Button type="submit" className="w-full mt-4">Submit Registration</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
