import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Calculator } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusinessTripDestinations } from '@/hooks/useBusinessTripDestinations';
import { useBusinessTripSettings } from '@/hooks/useBusinessTripSettings';
import { useCreateBusinessTrip, calculateNights, calculatePerDiem } from '@/hooks/useBusinessTrips';
import { CountrySelect } from '@/components/ui/country-select';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { FormSection, FormActions, FormFieldGroup } from '@/components/ui/form-section';

const tripFormSchema = z.object({
  destination_id: z.string().min(1, 'Destination is required'),
  origin_country: z.string().optional(),
  origin_city: z.string().optional(),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date({ required_error: 'End date is required' }),
  travel_mode: z.enum(['plane', 'car']),
  corporate_card_used: z.boolean(),
  flight_details: z.string().optional(),
}).refine(data => data.end_date >= data.start_date, {
  message: 'End date must be after start date',
  path: ['end_date'],
});

type TripFormValues = z.infer<typeof tripFormSchema>;

interface CreateTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTripDialog({ open, onOpenChange }: CreateTripDialogProps) {
  const { profile } = useAuth();
  const { data: destinations, isLoading: loadingDestinations } = useBusinessTripDestinations();
  
  const { data: settings } = useBusinessTripSettings();
  const createTrip = useCreateBusinessTrip();

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      travel_mode: 'plane',
      corporate_card_used: false,
      flight_details: '',
    },
  });

  const watchedValues = form.watch();
  const selectedDestination = destinations?.find(d => d.id === watchedValues.destination_id);

  // Calculate per diem live
  const nights = watchedValues.start_date && watchedValues.end_date
    ? calculateNights(watchedValues.start_date.toISOString(), watchedValues.end_date.toISOString())
    : 0;

  const perDiemRate = selectedDestination?.per_diem_rate_bhd || 0;
  const carUplift = settings?.car_uplift_per_night_bhd || 20;

  const perDiemCalc = calculatePerDiem(
    nights,
    perDiemRate,
    watchedValues.travel_mode,
    watchedValues.corporate_card_used,
    carUplift
  );
  
  const budget = perDiemCalc.per_diem_budget_bhd;
  const payable = perDiemCalc.per_diem_payable_bhd;
  const carUpliftTotal = perDiemCalc.car_uplift_total_bhd;

  const handleSubmit = async (values: TripFormValues, asDraft: boolean) => {
    if (!selectedDestination) {
      toast({
        title: 'Error',
        description: 'Please select a destination',
        variant: 'destructive',
      });
      return;
    }

    if (!profile?.employee_id) {
      toast({
        title: 'Error',
        description: 'Unable to find your employee profile',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTrip.mutateAsync({
        employee_id: profile.employee_id,
        destination_id: values.destination_id,
        origin_country: values.origin_country,
        origin_city: values.origin_city,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: format(values.end_date, 'yyyy-MM-dd'),
        travel_mode: values.travel_mode,
        corporate_card_used: values.corporate_card_used,
        flight_details: values.flight_details,
        status: asDraft ? 'draft' : 'submitted',
        nights_count: nights,
        per_diem_rate_bhd: perDiemRate,
        car_uplift_per_night_bhd: perDiemCalc.car_uplift_per_night_bhd,
        car_uplift_total_bhd: carUpliftTotal,
        per_diem_budget_bhd: budget,
        per_diem_payable_bhd: payable,
      });
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="2xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Business Trip Request</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-6">
            {/* Destination & Origin */}
            <FormSection title="Trip Details" description="Where are you traveling to and from?">
              <FormField
                control={form.control}
                name="destination_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingDestinations ? (
                          <div className="p-2 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                          </div>
                        ) : destinations?.length === 0 ? (
                          <div className="p-2 text-center text-muted-foreground">
                            No destinations configured
                          </div>
                        ) : (
                          destinations?.map(dest => (
                            <SelectItem key={dest.id} value={dest.id}>
                              {dest.name} ({dest.country}) - BHD {dest.per_diem_rate_bhd}/night
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormFieldGroup>
                <FormField
                  control={form.control}
                  name="origin_country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin Country</FormLabel>
                      <FormControl>
                        <CountrySelect
                          value={field.value || ''}
                          onValueChange={field.onChange}
                          placeholder="Select departure country"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="origin_city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Origin City (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Manama"
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormFieldGroup>
            </FormSection>

            {/* Dates */}
            <FormSection title="Travel Dates">
              <FormFieldGroup>
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => watchedValues.start_date ? date < watchedValues.start_date : false}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormFieldGroup>
            </FormSection>

            {/* Travel Options */}
            <FormSection title="Travel Options">
              <FormField
                control={form.control}
                name="travel_mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Mode *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="plane" id="plane" />
                          <Label htmlFor="plane">Plane</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="car" id="car" />
                          <Label htmlFor="car">Car (+BHD {carUplift}/night)</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="corporate_card_used"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Corporate Credit Card</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        If using corporate card, per diem will not be paid as cash
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="flight_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Details (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter flight numbers, times, booking references..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* Per Diem Calculation Preview */}
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Per Diem Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nights:</span>
                  <span className="font-medium">{nights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Diem Rate:</span>
                  <span className="font-medium">BHD {perDiemRate.toFixed(3)}/night</span>
                </div>
                {watchedValues.travel_mode === 'car' && (
                  <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground">Car Uplift:</span>
                    <span className="font-medium">+BHD {carUpliftTotal.toFixed(3)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-border/50">
                  <span className="text-muted-foreground">Per Diem Budget:</span>
                  <span className="font-semibold">BHD {budget.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Diem Payable:</span>
                  <span className="font-semibold text-primary">
                    BHD {payable.toFixed(3)}
                    {watchedValues.corporate_card_used && (
                      <span className="text-xs text-muted-foreground ml-1">(Corp Card)</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => form.handleSubmit((v) => handleSubmit(v, true))()}
            disabled={createTrip.isPending}
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => form.handleSubmit((v) => handleSubmit(v, false))()}
            disabled={createTrip.isPending || !selectedDestination}
          >
            {createTrip.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit for Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
