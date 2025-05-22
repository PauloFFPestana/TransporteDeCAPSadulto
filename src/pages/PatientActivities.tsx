import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PatientActivityWithDetails, daysOfWeek } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const patientActivityFormSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  activityId: z.string().min(1, "Selecione uma atividade"),
  transportNeeded: z.boolean().default(true),
});

type PatientActivityFormValues = z.infer<typeof patientActivityFormSchema>;

const PatientActivities = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatientActivity, setEditingPatientActivity] = useState<PatientActivityWithDetails | null>(null);
  
  const form = useForm<PatientActivityFormValues>({
    resolver: zodResolver(patientActivityFormSchema),
    defaultValues: {
      patientId: "",
      activityId: "",
      transportNeeded: true,
    },
  });
  
  const { data: patientActivities, isLoading, refetch } = useQuery<PatientActivityWithDetails[]>({
    queryKey: ["/api/patient-activities"],
    queryFn: async () => {
      const res = await apiRequest("/api/patient-activities");
      return res.json();
    },
  });

  const { data: patients } = useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const res = await apiRequest("/api/patients");
      return res.json();
    },
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const res = await apiRequest("/api/activities");
      return res.json();
    },
  });
  
  const filteredPatientActivities = patientActivities?.filter(patientActivity => 
    patientActivity.patientName.toLowerCase().includes(search.toLowerCase()) ||
    patientActivity.activityName.toLowerCase().includes(search.toLowerCase()) ||
    patientActivity.therapistName.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleOpenEditForm = (patientActivity: PatientActivityWithDetails) => {
    setEditingPatientActivity(patientActivity);
    form.reset({
      patientId: String(patientActivity.patientId),
      activityId: String(patientActivity.activityId),
      transportNeeded: patientActivity.transportNeeded,
    });
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPatientActivity(null);
    form.reset();
  };
  
  const onSubmit = async (data: PatientActivityFormValues) => {
    try {
      const payload = {
        ...data,
        patientId: parseInt(data.patientId),
        activityId: parseInt(data.activityId),
      };
      
      if (editingPatientActivity) {
        // Update existing patient activity
        await apiRequest(`/api/patient-activities/${editingPatientActivity.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        toast({
          title: "Atividade do paciente atualizada",
          description: "A atividade do paciente foi atualizada com sucesso.",
        });
      } else {
        // Create new patient activity
        await apiRequest("/api/patient-activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        toast({
          title: "Atividade do paciente criada",
          description: "A atividade do paciente foi criada com sucesso.",
        });
      }
      
      handleCloseForm();
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a atividade do paciente.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeletePatientActivity = async (id: number) => {
    try {
      await apiRequest(`/api/patient-activities/${id}`, {
        method: "DELETE",
      });
      
      toast({
        title: "Atividade do paciente excluída",
        description: "A atividade do paciente foi excluída com sucesso.",
      });
      
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a atividade do paciente.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-700">Atividades dos Pacientes</h2>
          <p className="text-neutral-500">Associação entre pacientes e atividades terapêuticas</p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="ri-search-line text-neutral-400"></i>
            </div>
          </div>
          <Button 
            className="bg-primary text-white whitespace-nowrap"
            onClick={() => setIsFormOpen(true)}
          >
            <i className="ri-add-line mr-1"></i> Adicionar
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-neutral-200 rounded-md w-3/4 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded-md w-1/2"></div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-200 rounded-md w-full"></div>
                  <div className="h-4 bg-neutral-200 rounded-md w-2/3"></div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-neutral-200 rounded-md w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredPatientActivities && filteredPatientActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatientActivities.map((patientActivity) => (
            <Card key={patientActivity.id} className="border-neutral-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {patientActivity.patientName}
                  </CardTitle>
                  <Badge variant={patientActivity.transportNeeded ? "default" : "outline"} className="text-xs">
                    {patientActivity.transportNeeded ? "Transporte" : "Sem transporte"}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-primary">
                  {patientActivity.activityName}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-500">Dia:</span>
                    <span className="font-medium">{daysOfWeek[patientActivity.dayOfWeek as keyof typeof daysOfWeek]}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-neutral-500">Horário:</span>
                    <span className="font-medium">{patientActivity.startTime.substring(0, 5)} - {patientActivity.endTime.substring(0, 5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Terapeuta:</span>
                    <span className="font-medium">{patientActivity.therapistName}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenEditForm(patientActivity)}
                >
                  <i className="ri-edit-line mr-1"></i> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeletePatientActivity(patientActivity.id)}
                >
                  <i className="ri-delete-bin-line mr-1"></i> Excluir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="text-5xl text-neutral-300 mb-4">
            <i className="ri-user-settings-line"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-600 mb-2">Nenhuma atividade de paciente encontrada</h3>
          <p className="text-neutral-500 mb-4">
            {search ? "Tente buscar com outros termos ou " : ""}
            adicione uma nova relação paciente-atividade para começar.
          </p>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-primary text-white"
          >
            <i className="ri-add-line mr-1"></i> Adicionar
          </Button>
        </div>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingPatientActivity ? "Editar Atividade do Paciente" : "Nova Atividade do Paciente"}
            </DialogTitle>
            <DialogDescription>
              Associe um paciente a uma atividade terapêutica.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paciente</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!!editingPatientActivity}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients?.map((patient) => (
                          <SelectItem key={patient.id} value={String(patient.id)}>
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
                name="activityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atividade</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                      disabled={!!editingPatientActivity}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma atividade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activities?.map((activity) => (
                          <SelectItem key={activity.id} value={String(activity.id)}>
                            {activity.name} ({daysOfWeek[activity.dayOfWeek as keyof typeof daysOfWeek]}, {activity.startTime.substring(0, 5)})
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
                name="transportNeeded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Necessita de Transporte</FormLabel>
                      <FormDescription>
                        O paciente precisa ser transportado para esta atividade?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPatientActivity ? "Salvar Alterações" : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientActivities;