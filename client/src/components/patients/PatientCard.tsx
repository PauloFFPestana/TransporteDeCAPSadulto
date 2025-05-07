import { Patient } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PatientForm from "./PatientForm";

type PatientCardProps = {
  patient: Patient;
  onUpdate: () => void;
};

const PatientCard = ({ patient, onUpdate }: PatientCardProps) => {
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

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
      <Card className="card">
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`h-12 w-12 bg-${getRandomColor(patient.name)} text-white rounded-full flex items-center justify-center text-lg font-medium mr-3`}>
                <span>{getInitials(patient.name)}</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{patient.name}</h3>
                <p className="text-sm text-neutral-500">ID: {patient.id}</p>
              </div>
            </div>
            <div>
              <button 
                className="text-neutral-400 hover:text-neutral-600"
                onClick={() => setIsEditFormOpen(true)}
              >
                <i className="ri-edit-line"></i>
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-neutral-500">Telefone</p>
              <p className="text-sm">{patient.phone || "Não informado"}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Endereço</p>
              <p className="text-sm">{patient.address || "Não informado"}</p>
            </div>
          </div>
          <div className="flex justify-between">
            <Button 
              variant="link" 
              className="text-primary text-sm font-medium flex items-center p-0" 
              onClick={() => setIsEditFormOpen(true)}
            >
              <i className="ri-edit-line mr-1"></i> Editar
            </Button>
            <span className={`text-sm ${patient.active ? "bg-[#2E7D32] bg-opacity-10 text-[#2E7D32]" : "bg-neutral-500 bg-opacity-10 text-neutral-500"} px-2 py-1 rounded-full`}>
              {patient.active ? "Ativo" : "Inativo"}
            </span>
          </div>
        </CardContent>
      </Card>

      <PatientForm 
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        patient={patient}
        onSuccess={onUpdate}
      />
    </>
  );
};

export default PatientCard;
