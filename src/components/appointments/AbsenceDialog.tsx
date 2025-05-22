import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type AbsenceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: number;
  date: string;
};

const AbsenceDialog = ({ open, onOpenChange, appointmentId, date }: AbsenceDialogProps) => {
  const { toast } = useToast();
  const [absentType, setAbsentType] = useState<string>("absent_patient");

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PATCH", `/api/appointments/${appointmentId}`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/appointments?date=${date}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/stats/transport?date=${date}`] });
      toast({
        title: "Ausência registrada",
        description: "A ausência foi registrada com sucesso.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar ausência. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    updateStatusMutation.mutate(absentType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Ausência</DialogTitle>
          <DialogDescription>
            Selecione o tipo de ausência para registrar no sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup 
            defaultValue="absent_patient" 
            value={absentType}
            onValueChange={setAbsentType}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="absent_patient" id="patient" />
              <Label htmlFor="patient" className="flex-1">
                Ausência do Paciente
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="absent_therapist" id="therapist" />
              <Label htmlFor="therapist" className="flex-1">
                Ausência do Terapeuta
              </Label>
            </div>
            <div className="flex items-center space-x-2 rounded-md border p-3">
              <RadioGroupItem value="cancelled" id="cancelled" />
              <Label htmlFor="cancelled" className="flex-1">
                Cancelado
              </Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={updateStatusMutation.isPending}
          >
            Registrar Ausência
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AbsenceDialog;
