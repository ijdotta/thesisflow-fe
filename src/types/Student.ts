import type {Person} from "@/types/Person.ts";

export interface Student extends Person{
  email: string,
  studentId: string,
  career: string,
}