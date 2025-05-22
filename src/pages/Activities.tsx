import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, ActivityWithNames, daysOfWeek } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const activityFormSchema = z.object({
  name: z.string().min(2, "O nome da atividade é obrigatório"),
  therapistId: z.string().min(1, "Selecione um terapeuta"),
  dayOfWeek: z.string().min(3, "Selecione um dia da semana"),
  startTime: z.string().min(1, "Horário inicial é obrigatório"),
  endTime: z.string().min(1, "Horário final é obrigatório"),
  notes: z.string().optional(),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

const Activities = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      name: "",
      therapistId: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      notes: "",
    },
  });
  
  const { data: activities, isLoading, refetch } = useQuery<ActivityWithNames[]>({
    queryKey: ["/api/activities"],
    queryFn: async () => {
      const res = await apiRequest("/api/activities");
      return res.json();
    },
  });

  const { data: therapists } = useQuery({
    queryKey: ["/api/therapists"],
    queryFn: async () => {
      const res = await apiRequest("/api/therapists");
      return res.json();
    },
  });
  
  const filteredActivities = activities?.filter(activity => {
    // Filter by search
    const searchMatch = 
      activity.name.toLowerCase().includes(search.toLowerCase()) ||
      activity.therapistName.toLowerCase().includes(search.toLowerCase());
    
    // Filter by tab
    if (activeTab !== "all") {
      return searchMatch && activity.dayOfWeek === activeTab;
    }
    
    return searchMatch;
  });
  
  const handleOpenEditForm = (activity: Activity) => {
    setEditingActivity(activity);
    form.reset({
      name: activity.name,
      therapistId: String(activity.therapistId),
      dayOfWeek: activity.dayOfWeek,
      startTime: activity.startTime.substring(0, 5),
      endTime: activity.endTime.substring(0, 5),
      notes: activity.notes || "",
    });
    setIsAddFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsAddFormOpen(false);
    setEditingActivity(null);
    form.reset();
  };
  
  const onSubmit = async (data: ActivityFormValues) => {
    try {
      const payload = {
        ...data,
        therapistId: parseInt(data.therapistId),
      };
      
      if (editingActivity) {
        // Update existing activity
        await apiRequest(`/api/activities/${editingActivity.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        toast({
          title: "Atividade atualizada",
          description: "A atividade foi atualizada com sucesso.",
        });
      } else {
        // Create new activity
        await apiRequest("/api/activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        toast({
          title: "Atividade criada",
          description: "A atividade foi criada com sucesso.",
        });
      }
      
      handleCloseForm();
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a atividade.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteActivity = async (id: number) => {
    try {
      await apiRequest(`/api/activities/${id}`, {
        method: "DELETE",
      });
      
      toast({
        title: "Atividade excluída",
        description: "A atividade foi excluída com sucesso.",
      });
      
      refetch();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a atividade.",
        variant: "destructive",
      });
    }
  };
  
  const renderActivityCards = () => {
    if (isLoading) {
      return (
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
      );
    }
    
    if (!filteredActivities || filteredActivities.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="text-5xl text-neutral-300 mb-4">
            <i className="ri-calendar-line"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-600 mb-2">Nenhuma atividade encontrada</h3>
          <p className="text-neutral-500 mb-4">
            {search ? "Tente buscar com outros termos ou " : ""}
            adicione uma nova atividade para começar.
          </p>
          <Button 
            onClick={() => setIsAddFormOpen(true)}
            className="bg-primary text-white"
          >
            <i className="ri-add-line mr-1"></i> Nova Atividade
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActivities.map((activity) => (
          <Card key={activity.id} className="border-neutral-200">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{activity.name}</CardTitle>
                <Badge variant="outline" className="text-xs font-normal">
                  {daysOfWeek[activity.dayOfWeek as keyof typeof daysOfWeek]}
                </Badge>
              </div>
              <div className="text-sm text-neutral-500">
                {activity.therapistName} ({activity.therapistSpecialty})
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Horário:</span>
                  <span>{activity.startTime.substring(0, 5)} - {activity.endTime.substring(0, 5)}</span>
                </div>
                {activity.notes && (
                  <div className="mt-2 text-neutral-600 text-xs italic">
                    <span className="font-medium">Observações:</span> {activity.notes}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOpenEditForm(activity)}
              >
                <i className="ri-edit-line mr-1"></i> Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleDeleteActivity(activity.id)}
              >
                <i className="ri-delete-bin-line mr-1"></i> Excluir
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-700">Gerenciamento de Atividades</h2>
          <p className="text-neutral-500">Cadastro e organização das atividades terapêuticas</p>
        </div>
        
        <div className="flex w-full md:w-auto space-x-2">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar atividades..."
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
            onClick={() => setIsAddFormOpen(true)}
          >
            <i className="ri-add-line mr-1"></i> Nova Atividade
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="Seg">Segunda</TabsTrigger>
          <TabsTrigger value="Ter">Terça</TabsTrigger>
          <TabsTrigger value="Qua">Quarta</TabsTrigger>
          <TabsTrigger value="Qui">Quinta</TabsTrigger>
          <TabsTrigger value="Sex">Sexta</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          {renderActivityCards()}
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Editar Atividade" : "Nova Atividade"}</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para {editingActivity ? "editar a" : "criar uma nova"} atividade.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Atividade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fisioterapia de Grupo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="therapistId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terapeuta Responsável</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um terapeuta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {therapists?.map((therapist) => (
                          <SelectItem key={therapist.id} value={String(therapist.id)}>
                            {therapist.name} ({therapist.specialty})
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
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dia da Semana</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(daysOfWeek).map(([key, value]) => (
                            <SelectItem key={key} value={key}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Início</FormLabel>
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
                        <FormLabel>Fim</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Informações adicionais sobre a atividade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingActivity ? "Salvar Alterações" : "Criar Atividade"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Activities;