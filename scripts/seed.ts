import { db } from '../server/db';
import { 
  patients, 
  therapists, 
  activities, 
  patientActivities,
  daysOfWeekShort
} from '../shared/schema';

// Seed function to populate the database with initial data
async function seed() {
  console.log('Seeding database...');
  
  try {
    // Add patients
    console.log('Adding patients...');
    const [patient1] = await db.insert(patients).values({
      name: "Maria Silva",
      phone: "(11) 98765-4321",
      address: "Rua das Flores, 123",
      active: true
    }).returning();
    
    const [patient2] = await db.insert(patients).values({
      name: "João Santos",
      phone: "(11) 91234-5678",
      address: "Av. Central, 456",
      active: true
    }).returning();
    
    const [patient3] = await db.insert(patients).values({
      name: "Pedro Almeida",
      phone: "(11) 99876-5432",
      address: "Rua do Pinheiro, 789",
      active: true
    }).returning();
    
    // Add therapists
    console.log('Adding therapists...');
    const [therapist1] = await db.insert(therapists).values({
      name: "Dr. Carlos Oliveira",
      specialty: "Fisioterapia",
      email: "carlos.oliveira@exemplo.com",
      phone: "(11) 97777-8888",
      workDays: "Seg,Qua,Sex",
      active: true
    }).returning();
    
    const [therapist2] = await db.insert(therapists).values({
      name: "Dra. Ana Pereira",
      specialty: "Terapia Ocupacional",
      email: "ana.pereira@exemplo.com",
      phone: "(11) 96666-7777",
      workDays: "Ter,Qui",
      active: true
    }).returning();
    
    const [therapist3] = await db.insert(therapists).values({
      name: "Dr. Bruno Costa",
      specialty: "Fonoaudiologia",
      email: "bruno.costa@exemplo.com",
      phone: "(11) 95555-6666",
      workDays: "Seg,Ter,Qua,Qui,Sex",
      active: true
    }).returning();
    
    // Add activities
    console.log('Adding activities...');
    const [activity1] = await db.insert(activities).values({
      name: "Fisioterapia em Grupo",
      therapistId: therapist1.id,
      dayOfWeek: "Seg",
      startTime: "09:00:00",
      endTime: "10:00:00",
      notes: "Sala 101",
      active: true
    }).returning();
    
    const [activity2] = await db.insert(activities).values({
      name: "Terapia Ocupacional",
      therapistId: therapist2.id,
      dayOfWeek: "Ter",
      startTime: "14:00:00",
      endTime: "15:30:00",
      notes: "Sala 102",
      active: true
    }).returning();
    
    const [activity3] = await db.insert(activities).values({
      name: "Fonoterapia",
      therapistId: therapist3.id,
      dayOfWeek: "Qua",
      startTime: "10:30:00",
      endTime: "11:30:00",
      notes: "Sala 103",
      active: true
    }).returning();
    
    const [activity4] = await db.insert(activities).values({
      name: "Fisioterapia Individual",
      therapistId: therapist1.id,
      dayOfWeek: "Qua",
      startTime: "13:00:00",
      endTime: "14:00:00",
      notes: "Sala 101",
      active: true
    }).returning();
    
    const [activity5] = await db.insert(activities).values({
      name: "Grupo de Fala",
      therapistId: therapist3.id,
      dayOfWeek: "Sex",
      startTime: "09:00:00",
      endTime: "10:30:00",
      notes: "Sala 104",
      active: true
    }).returning();
    
    // Assign patients to activities
    console.log('Adding patient activities...');
    await db.insert(patientActivities).values([
      {
        patientId: patient1.id,
        activityId: activity1.id,
        transportNeeded: true,
        active: true
      },
      {
        patientId: patient1.id,
        activityId: activity3.id,
        transportNeeded: true,
        active: true
      },
      {
        patientId: patient2.id,
        activityId: activity2.id,
        transportNeeded: true, 
        active: true
      },
      {
        patientId: patient2.id,
        activityId: activity5.id,
        transportNeeded: true,
        active: true
      },
      {
        patientId: patient3.id,
        activityId: activity4.id,
        transportNeeded: true,
        active: true
      }
    ]);
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the seed function
seed();