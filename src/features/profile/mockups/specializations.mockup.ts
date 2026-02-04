import { faker } from "@faker-js/faker";
import type {
    Specialization,
    SpecializationsResponse,
} from "../interfaces/specialization.interface";

const arabicWords = [
    "نظم المعلومات",
    "هندسة البرمجيات",
    "الذكاء الاصطناعي",
    "أمن المعلومات",
    "تحليل البيانات",
];

const generateSpecialization = (): Specialization => ({
    id: faker.string.uuid(),

    name_en: faker.person.jobArea(),
    name_ar: faker.helpers.arrayElement(arabicWords),

    description_en: faker.lorem.paragraph(),
    description_ar: faker.helpers.arrayElement([
        "وصف التخصص باللغة العربية",
        "هذا التخصص يركز على تطوير المهارات",
        "تخصص تقني متقدم",
    ]),
});

const specializations: Specialization[] = Array.from(
    { length: 15 },
    generateSpecialization
);

export const specializationsMock: SpecializationsResponse = {
    data: specializations,
    meta_data: {
        total: specializations.length,
        page_index: 1,
        page_size: 10,
    },
};
