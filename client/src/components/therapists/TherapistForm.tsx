import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { therapistFormSchema, Therapist } from "@shared/schema";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
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

type TherapistFormValues = z.infer<typeof therapistFormSchema>;

type TherapistFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  therapist?: Therapist;
  onSuccess?: () => void;
};

const TherapistForm = ({ open, onOpenChange, therapist, onSuccess }: TherapistFormProps) => {
  const { toast } = useToast();
  const isEditing = !!therapist;

  const form = useForm<TherapistFormValues>({
    resolver: zodResolver(therapistFormSchema),
    defaultValues: {
      name: therapist?.name || "",
      specialty: therapist?.specialty || "",
      email: therapist?.email || "",
      phone: therapist?.phone || "",
      workDays: therapist?.workDays || "",
      active: therapist?.active ?? true,
    },
  });

  const createTherapistMutation = useMutation({
    mutationFn: async (data: TherapistFormValues) => {
      const res = await apiRequest("POST", "/api/therapists", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapists"] });
      toast({
        title: "Terapeuta criado",
        description: "O terapeuta foi criado com sucesso.",
      });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar o terapeuta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateTherapistMutation = useMutation({
    mutationFn: async (data: TherapistFormValues) => {
      const res = await apiRequest(
        "PATCH",
        `/api/therapists/${therapist?.id}`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/therapists"] });
      toast({
        title: "Terapeuta atualizado",
        description: "O terapeuta foi atualizado com sucesso.",
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar o terapeuta. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TherapistFormValues) => {
    if (isEditing) {
      updateTherapistMutation.mutate(data);
    } else {
      createTherapistMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Terapeuta" : "Novo Terapeuta"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do terapeuta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Especialidade do terapeuta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email do terapeuta" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias de Atendimento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Seg, Qua, Sex" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Terapeuta ativo</FormLabel>
                  </div>
                  <FormMessage />
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
                disabled={createTherapistMutation.isPending || updateTherapistMutation.isPending}
              >
                {isEditing ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TherapistForm;
