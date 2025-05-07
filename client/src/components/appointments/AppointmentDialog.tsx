import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentFormSchema, AppointmentWithNames } from "@shared/schema";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AppointmentFormValues = z.infer<typeof appointmentFormSchema> & {
  startTime: string;
  endTime: string;
};

type AppointmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  appointment?: AppointmentWithNames | null;
};

const AppointmentDialog = ({ open, onOpenChange, date, appointment }: AppointmentDialogProps) => {
  const { toast } = useToast();
  const isEditing = !!appointment;
  const [dateValue, setDateValue] = useState(date);

  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
    enabled: open,
  });

  const { data: therapists } = useQuery({
    queryKey: ["/api/therapists"],
    enabled: open,
  });

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: appointment?.patientId || 0,
      therapistId: appointment?.therapistId || 0,
      date: appointment?.date ? new Date(appointment.date) : new Date(date),
      startTime: appointment?.startTime ? appointment.startTime.substring(0, 5) : "",
      endTime: appointment?.endTime ? appointment.endTime.substring(0, 5) : "",
      notes: appointment?.notes || "",
      transportNeeded: appointment?.transportNeeded ?? true,
      status: appointment?.status || "confirmed",
    },
  });

  useEffect(() => {
    if (open && appointment) {
      form.reset({
        patientId: appointment.patientId,
        therapistId: appointment.therapistId,
        date: appointment.date ? new Date(appointment.date) : new Date(date),
        startTime: appointment.startTime ? appointment.startTime.substring(0, 5) : "",
        endTime: appointment.endTime ? appointment.endTime.substring(0, 5) : "",
        notes: appointment.notes || "",
        transportNeeded: appointment.transportNeeded,
        status: appointment.status,
      });
      setDateValue(appointment.date);
    } else if (open) {
      form.reset({
        patientId: 0,
        therapistId: 0,
        date: new Date(date),
        startTime: "",
        endTime: "",
        notes: "",
        transportNeeded: true,
        status: "confirmed",
      });
      setDateValue(date);
    }
  }, [open, appointment, date, form]);

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const formattedData = {
        ...data,
        date: data.date.toISOString().split('T')[0],
        startTime: data.startTime + ":00",
        endTime: data.endTime + ":00",
      };
      
      const res = await apiRequest("POST", "/api/appointments", formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments?date=${dateValue}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/transport?date=${dateValue}`] });
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormValues) => {
      const formattedData = {
        ...data,
        date: data.date.toISOString().split('T')[0],
        startTime: data.startTime + ":00",
        endTime: data.endTime + ":00",
      };
      
      const res = await apiRequest(
        "PATCH",
        `/api/appointments/${appointment?.id}`,
        formattedData
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments?date=${dateValue}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/transport?date=${dateValue}`] });
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar o agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AppointmentFormValues) => {
    if (isEditing) {
      updateAppointmentMutation.mutate(data);
    } else {
      createAppointmentMutation.mutate(data);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateValue(e.target.value);
    form.setValue("date", new Date(e.target.value));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="mb-4">
              <FormLabel>Data</FormLabel>
              <Input
                type="date"
                value={dateValue}
                onChange={handleDateChange}
                className="w-full"
              />
            </div>
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um paciente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients?.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="therapistId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terapeuta</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um terapeuta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {therapists?.map((therapist) => (
                        <SelectItem key={therapist.id} value={therapist.id.toString()}>
                          {therapist.name} - {therapist.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Início</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário Fim</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações sobre o agendamento"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transportNeeded"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Necessita transporte</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
              >
                {isEditing ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;
