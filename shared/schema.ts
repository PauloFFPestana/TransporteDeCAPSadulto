import { pgTable, text, serial, integer, boolean, timestamp, date, time, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Patients
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  active: boolean("active").default(true).notNull(),
});

export const patientsRelations = relations(patients, ({ many }) => ({
  patientActivities: many(patientActivities),
  absences: many(patientAbsences),
}));

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

export const therapistsRelations = relations(therapists, ({ many }) => ({
  activities: many(activities),
  absences: many(therapistAbsences),
}));

export const insertTherapistSchema = createInsertSchema(therapists).omit({
  id: true,
});

// Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  therapistId: integer("therapist_id").notNull(),
  dayOfWeek: text("day_of_week").notNull(), // Seg, Ter, Qua, Qui, Sex
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
});

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  therapist: one(therapists, {
    fields: [activities.therapistId],
    references: [therapists.id],
  }),
  patientActivities: many(patientActivities),
}));

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
});

// Patient Activities (Associação de pacientes com atividades)
export const patientActivities = pgTable("patient_activities", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  activityId: integer("activity_id").notNull(),
  transportNeeded: boolean("transport_needed").default(true).notNull(),
  active: boolean("active").default(true).notNull(),
});

export const patientActivitiesRelations = relations(patientActivities, ({ one }) => ({
  patient: one(patients, {
    fields: [patientActivities.patientId],
    references: [patients.id],
  }),
  activity: one(activities, {
    fields: [patientActivities.activityId],
    references: [activities.id],
  }),
}));

export const insertPatientActivitySchema = createInsertSchema(patientActivities).omit({
  id: true,
});

// Patient Absences
export const patientAbsences = pgTable("patient_absences", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  date: date("date").notNull(),
  reason: text("reason"),
});

export const patientAbsencesRelations = relations(patientAbsences, ({ one }) => ({
  patient: one(patients, {
    fields: [patientAbsences.patientId],
    references: [patients.id],
  }),
}));

export const insertPatientAbsenceSchema = createInsertSchema(patientAbsences).omit({
  id: true,
});

// Therapist Absences
export const therapistAbsences = pgTable("therapist_absences", {
  id: serial("id").primaryKey(),
  therapistId: integer("therapist_id").notNull(),
  date: date("date").notNull(),
  reason: text("reason"),
});

export const therapistAbsencesRelations = relations(therapistAbsences, ({ one }) => ({
  therapist: one(therapists, {
    fields: [therapistAbsences.therapistId],
    references: [therapists.id],
  }),
}));

export const insertTherapistAbsenceSchema = createInsertSchema(therapistAbsences).omit({
  id: true,
});

// Types for selects and inserts
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Therapist = typeof therapists.$inferSelect;
export type InsertTherapist = z.infer<typeof insertTherapistSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type PatientActivity = typeof patientActivities.$inferSelect;
export type InsertPatientActivity = z.infer<typeof insertPatientActivitySchema>;

export type PatientAbsence = typeof patientAbsences.$inferSelect;
export type InsertPatientAbsence = z.infer<typeof insertPatientAbsenceSchema>;

export type TherapistAbsence = typeof therapistAbsences.$inferSelect;
export type InsertTherapistAbsence = z.infer<typeof insertTherapistAbsenceSchema>;

// Additional types for frontend use
export type ActivityWithNames = Activity & {
  therapistName: string;
  therapistSpecialty: string;
};

export type PatientActivityWithDetails = PatientActivity & {
  patientName: string;
  activityName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  therapistName: string;
  therapistSpecialty: string;
};

export type TransportListItem = {
  patientId: number;
  patientName: string;
  activities: {
    activityId: number;
    activityName: string;
    therapistName: string;
    startTime: string;
    endTime: string;
  }[];
  isAbsent: boolean;
};

export type WeeklySchedule = {
  monday: TransportListItem[];
  tuesday: TransportListItem[];
  wednesday: TransportListItem[];
  thursday: TransportListItem[];
  friday: TransportListItem[];
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

export const activityFormSchema = insertActivitySchema.extend({
  name: z.string().min(2, "O nome da atividade é obrigatório"),
  therapistId: z.number().min(1, "Selecione um terapeuta"),
  dayOfWeek: z.string().min(3, "Selecione um dia da semana"),
  startTime: z.string().min(1, "Horário inicial é obrigatório"),
  endTime: z.string().min(1, "Horário final é obrigatório"),
  notes: z.string().optional(),
});

export const patientActivityFormSchema = insertPatientActivitySchema.extend({
  patientId: z.number().min(1, "Selecione um paciente"),
  activityId: z.number().min(1, "Selecione uma atividade"),
  transportNeeded: z.boolean().default(true),
});

export const patientAbsenceFormSchema = insertPatientAbsenceSchema.extend({
  patientId: z.number().min(1, "Selecione um paciente"),
  date: z.date({ required_error: "Selecione uma data" }),
  reason: z.string().optional(),
});

export const therapistAbsenceFormSchema = insertTherapistAbsenceSchema.extend({
  therapistId: z.number().min(1, "Selecione um terapeuta"),
  date: z.date({ required_error: "Selecione uma data" }),
  reason: z.string().optional(),
});

// Date formatting helper functions
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatTime(time: string): string {
  return time.substring(0, 5); // Returns just HH:MM
}

export const daysOfWeek = {
  Seg: "Segunda-feira",
  Ter: "Terça-feira",
  Qua: "Quarta-feira",
  Qui: "Quinta-feira",
  Sex: "Sexta-feira",
};

export const daysOfWeekShort = ["Seg", "Ter", "Qua", "Qui", "Sex"];

export type DayOfWeekType = "Seg" | "Ter" | "Qua" | "Qui" | "Sex";

export const absentReasons = {
  sick: "Doença",
  vacation: "Férias",
  personal: "Motivo pessoal",
  other: "Outro",
};
