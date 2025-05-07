import { pgTable, text, serial, integer, boolean, timestamp, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Patients
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  active: boolean("active").default(true).notNull(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
});

// Therapists
export const therapists = pgTable("therapists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  email: text("email"),
  phone: text("phone"),
  workDays: text("work_days"), // comma separated list of days: "Mon,Wed,Fri"
  active: boolean("active").default(true).notNull(),
});

export const insertTherapistSchema = createInsertSchema(therapists).omit({
  id: true,
});

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  therapistId: integer("therapist_id").notNull(),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  notes: text("notes"),
  transportNeeded: boolean("transport_needed").default(true).notNull(),
  status: text("status").default("confirmed").notNull(), // confirmed, absent_patient, absent_therapist, cancelled
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
});

// Types for selects and inserts
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Therapist = typeof therapists.$inferSelect;
export type InsertTherapist = z.infer<typeof insertTherapistSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Additional types for frontend use
export type AppointmentWithNames = Appointment & {
  patientName: string;
  therapistName: string;
  therapistSpecialty: string;
};

// Validation schemas for forms
export const patientFormSchema = insertPatientSchema.extend({
  name: z.string().min(2, "O nome é obrigatório"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const therapistFormSchema = insertTherapistSchema.extend({
  name: z.string().min(2, "O nome é obrigatório"),
  specialty: z.string().min(2, "A especialidade é obrigatória"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  workDays: z.string().optional(),
});

export const appointmentFormSchema = insertAppointmentSchema.extend({
  patientId: z.number().min(1, "Selecione um paciente"),
  therapistId: z.number().min(1, "Selecione um terapeuta"),
  date: z.date({ required_error: "Selecione uma data" }),
  startTime: z.string().min(1, "Horário inicial é obrigatório"),
  endTime: z.string().min(1, "Horário final é obrigatório"),
  notes: z.string().optional(),
  transportNeeded: z.boolean().default(true),
});

// Date formatting helper functions
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTime(time: string): string {
  return time.substring(0, 5); // Returns just HH:MM
}

export const statusLabels: Record<string, string> = {
  confirmed: "Confirmado",
  absent_patient: "Ausente (Paciente)",
  absent_therapist: "Ausente (Terapeuta)",
  cancelled: "Cancelado"
};

export const statusColors: Record<string, string> = {
  confirmed: "bg-status-success bg-opacity-10 text-status-success",
  absent_patient: "bg-status-error bg-opacity-10 text-status-error",
  absent_therapist: "bg-status-warning bg-opacity-10 text-status-warning",
  cancelled: "bg-neutral-500 bg-opacity-10 text-neutral-500"
};
