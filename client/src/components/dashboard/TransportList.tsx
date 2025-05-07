import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppointmentWithNames, statusLabels, statusColors } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AppointmentDialog from "@/components/appointments/AppointmentDialog";
import AbsenceDialog from "@/components/appointments/AbsenceDialog";

type TransportListProps = {
  date: string;
};

const TransportList = ({ date }: TransportListProps) => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [absenceDialogData, setAbsenceDialogData] = useState<{
    appointmentId: number;
    isOpen: boolean;
  }>({ appointmentId: 0, isOpen: false });
  const [editDialogData, setEditDialogData] = useState<{
    appointment: AppointmentWithNames | null;
    isOpen: boolean;
  }>({ appointment: null, isOpen: false });

  const ITEMS_PER_PAGE = 5;

  const { data: appointments, isLoading } = useQuery<AppointmentWithNames[]>({
    queryKey: [`/api/appointments?date=${date}`],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments?date=${date}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/transport?date=${date}`] });
      toast({
        title: "Status atualizado",
        description: "O status do agendamento foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar o status do agendamento.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAbsent = (appointmentId: number) => {
    setAbsenceDialogData({ appointmentId, isOpen: true });
  };

  const handleMarkPresent = (appointmentId: number) => {
    updateStatusMutation.mutate({ id: appointmentId, status: "confirmed" });
  };

  const handleEditModal = (appointment: AppointmentWithNames) => {
    setEditDialogData({ appointment, isOpen: true });
  };

  const paginatedItems = appointments
    ? appointments.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
    : [];

  const totalPages = appointments ? Math.ceil(appointments.length / ITEMS_PER_PAGE) : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Lista de Transporte do Dia</h3>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Paciente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Terapeuta</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Horário</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {[...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
                      <div className="ml-4 space-y-2">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        <div className="h-3 w-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-5 w-24 bg-gray-200 rounded-full"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-3">
                      <div className="h-5 w-5 bg-gray-200 rounded"></div>
                      <div className="h-5 w-5 bg-gray-200 rounded"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  function getRandomColor(name: string): string {
    const colors = ["primary", "secondary", "accent"];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold">Lista de Transporte do Dia</h3>
          <Button 
            className="bg-primary text-white" 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <i className="ri-add-line mr-1"></i> Adicionar
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Paciente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Terapeuta</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Horário</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 bg-${getRandomColor(appointment.patientName)} text-white rounded-full flex items-center justify-center`}>
                          <span>{getInitials(appointment.patientName)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-700">{appointment.patientName}</div>
                          <div className="text-sm text-neutral-500">ID: {appointment.patientId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-700">{appointment.therapistName}</div>
                      <div className="text-sm text-neutral-500">{appointment.therapistSpecialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                      {appointment.startTime.substring(0, 5)} - {appointment.endTime.substring(0, 5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[appointment.status]}`}>
                        {statusLabels[appointment.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-primary hover:text-primary-dark mr-3"
                        onClick={() => handleEditModal(appointment)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      {appointment.status === "confirmed" ? (
                        <button 
                          className="text-[#D32F2F] hover:text-red-700"
                          onClick={() => handleMarkAbsent(appointment.id)}
                        >
                          <i className="ri-close-circle-line"></i>
                        </button>
                      ) : (
                        <button 
                          className="text-[#2E7D32] hover:text-green-700"
                          onClick={() => handleMarkPresent(appointment.id)}
                        >
                          <i className="ri-check-line"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-neutral-500">
                    Nenhum agendamento encontrado para esta data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="bg-neutral-50 px-4 py-3 border-t border-neutral-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-neutral-500">
                Mostrando <span className="font-medium">{paginatedItems.length}</span> de{" "}
                <span className="font-medium">{appointments?.length}</span> agendamentos
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className={`px-3 py-1 border border-neutral-300 bg-white text-neutral-700 rounded-md hover:bg-neutral-100 disabled:opacity-50`}
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Anterior
                </button>
                <button
                  className={`px-3 py-1 border border-neutral-300 bg-white text-neutral-700 rounded-md hover:bg-neutral-100 disabled:opacity-50`}
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Próximo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AppointmentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        date={date}
      />

      <AppointmentDialog 
        open={editDialogData.isOpen} 
        onOpenChange={(open) => setEditDialogData({ ...editDialogData, isOpen: open })} 
        date={date}
        appointment={editDialogData.appointment}
      />

      <AbsenceDialog 
        open={absenceDialogData.isOpen}
        onOpenChange={(open) => setAbsenceDialogData({ ...absenceDialogData, isOpen: open })}
        appointmentId={absenceDialogData.appointmentId}
        date={date}
      />
    </>
  );
};

export default TransportList;
