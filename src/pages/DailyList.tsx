import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TransportListItem, WeeklySchedule, daysOfWeek } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const DailyList = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<string>(() => {
    // Start from Monday of current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, otherwise go back to Monday
    today.setDate(today.getDate() - daysToSubtract);
    return today.toISOString().split("T")[0];
  });
  
  const [activeDay, setActiveDay] = useState<string>("monday");
  
  const { data: weeklySchedule, isLoading, refetch } = useQuery<WeeklySchedule>({
    queryKey: ["/api/transport/weekly", startDate],
    queryFn: async () => {
      const res = await apiRequest(`/api/transport/weekly?startDate=${startDate}`);
      return res.json();
    }
  });
  
  const handlePreviousWeek = () => {
    const date = new Date(startDate);
    date.setDate(date.getDate() - 7);
    setStartDate(date.toISOString().split("T")[0]);
  };
  
  const handleNextWeek = () => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 7);
    setStartDate(date.toISOString().split("T")[0]);
  };
  
  const formatWeekRange = () => {
    const start = new Date(startDate);
    const end = new Date(startDate);
    end.setDate(end.getDate() + 4); // Friday
    
    const formatOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    };
    
    return `${start.toLocaleDateString("pt-BR", formatOptions)} - ${end.toLocaleDateString("pt-BR", formatOptions)}`;
  };
  
  const handlePatientAbsenceToggle = async (patientId: number, isCurrentlyAbsent: boolean, day: string) => {
    try {
      // Calculate date from day of week
      const dayIndex = ["monday", "tuesday", "wednesday", "thursday", "friday"].indexOf(day);
      if (dayIndex === -1) return;
      
      const date = new Date(startDate);
      date.setDate(date.getDate() + dayIndex);
      const formattedDate = date.toISOString().split("T")[0];
      
      if (isCurrentlyAbsent) {
        // Get all absences for this date
        const absencesRes = await apiRequest(`/api/patient-absences?date=${formattedDate}`);
        const absences = await absencesRes.json();
        
        // Find and delete this patient's absence
        const patientAbsence = absences.find((absence: any) => absence.patientId === patientId);
        if (patientAbsence) {
          await apiRequest(`/api/patient-absences/${patientAbsence.id}`, {
            method: "DELETE"
          });
        }
      } else {
        // Create new absence
        await apiRequest("/api/patient-absences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            patientId,
            date: formattedDate,
            reason: "Ausência registrada pela lista de transporte"
          })
        });
      }
      
      refetch();
      toast({
        title: "Sucesso",
        description: isCurrentlyAbsent ? "Presença do paciente registrada" : "Ausência do paciente registrada",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar a ausência/presença",
        variant: "destructive"
      });
    }
  };
  
  const handleTherapistAbsenceToggle = async (therapistId: number, day: string) => {
    try {
      // TODO: Implementar toggle de ausência de terapeuta
      toast({
        title: "Funcionalidade não implementada",
        description: "O registro de ausência de terapeutas será implementado em breve"
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar a ausência/presença do terapeuta",
        variant: "destructive"
      });
    }
  };
  
  const getDayContent = (day: string) => {
    if (!weeklySchedule) return null;
    
    let transportList: TransportListItem[] = [];
    switch (day) {
      case "monday":
        transportList = weeklySchedule.monday;
        break;
      case "tuesday":
        transportList = weeklySchedule.tuesday;
        break;
      case "wednesday":
        transportList = weeklySchedule.wednesday;
        break;
      case "thursday":
        transportList = weeklySchedule.thursday;
        break;
      case "friday":
        transportList = weeklySchedule.friday;
        break;
    }
    
    if (transportList.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="text-5xl text-neutral-300 mb-4">
            <i className="ri-calendar-event-line"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-600 mb-2">Nenhuma atividade programada</h3>
          <p className="text-neutral-500">
            Não há atividades ou pacientes agendados para este dia.
          </p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {transportList.map((item) => (
          <Card key={item.patientId} className={item.isAbsent ? "border-neutral-200 bg-neutral-50" : "border-neutral-200"}>
            <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`patient-${item.patientId}`}
                  checked={!item.isAbsent}
                  onCheckedChange={(checked) => handlePatientAbsenceToggle(item.patientId, item.isAbsent, day)}
                />
                <CardTitle className="text-base">
                  {item.isAbsent ? (
                    <span className="text-neutral-400 line-through">{item.patientName}</span>
                  ) : (
                    <span>{item.patientName}</span>
                  )}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="space-y-2">
                {item.activities.length > 0 ? (
                  item.activities.map((activity, index) => (
                    <div 
                      key={index} 
                      className="text-sm flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{activity.activityName}</span>
                        <span className="text-xs text-neutral-500">({activity.therapistName})</span>
                      </div>
                      <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded">
                        {activity.startTime.substring(0, 5)} - {activity.endTime.substring(0, 5)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-neutral-400 italic">Sem atividades</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-700">Lista de Transporte</h2>
          <p className="text-neutral-500">Planejamento semanal de transporte de pacientes</p>
        </div>
        
        <div className="w-full md:w-auto flex space-x-2">
          <div className="bg-white rounded-lg shadow flex items-center p-2 flex-grow">
            <Button variant="ghost" size="sm" onClick={handlePreviousWeek}>
              <i className="ri-arrow-left-s-line"></i>
            </Button>
            <div className="flex-grow text-center font-medium text-sm">
              {formatWeekRange()}
            </div>
            <Button variant="ghost" size="sm" onClick={handleNextWeek}>
              <i className="ri-arrow-right-s-line"></i>
            </Button>
          </div>
          <Button className="whitespace-nowrap">
            <i className="ri-printer-line mr-1"></i> Imprimir
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <Tabs defaultValue="monday" value={activeDay} onValueChange={setActiveDay}>
          <TabsList className="w-full grid grid-cols-5 bg-neutral-50 border-b">
            <TabsTrigger value="monday" className="py-3">Segunda</TabsTrigger>
            <TabsTrigger value="tuesday" className="py-3">Terça</TabsTrigger>
            <TabsTrigger value="wednesday" className="py-3">Quarta</TabsTrigger>
            <TabsTrigger value="thursday" className="py-3">Quinta</TabsTrigger>
            <TabsTrigger value="friday" className="py-3">Sexta</TabsTrigger>
          </TabsList>
          
          <div className="p-4">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-neutral-100 h-24 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="monday" className="mt-0">
                  {getDayContent("monday")}
                </TabsContent>
                <TabsContent value="tuesday" className="mt-0">
                  {getDayContent("tuesday")}
                </TabsContent>
                <TabsContent value="wednesday" className="mt-0">
                  {getDayContent("wednesday")}
                </TabsContent>
                <TabsContent value="thursday" className="mt-0">
                  {getDayContent("thursday")}
                </TabsContent>
                <TabsContent value="friday" className="mt-0">
                  {getDayContent("friday")}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default DailyList;
