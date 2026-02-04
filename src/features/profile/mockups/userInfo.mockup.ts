// mockups/users.mock.ts

import { faker } from "@faker-js/faker";
import type { User } from "../interfaces/user.interface";

const arabicNames = {
    first: ["أحمد", "محمد", "علي", "عمر", "حسن"],
    last: ["السيد", "حسين", "مصطف", "إبراهيم"],
    jobs: ["مهندس برمجيات", "محلل نظم", "مدير مشروع", "مصمم UI"],
};

export const generateUser = (): User => ({
    id: faker.string.uuid(),
    image: faker.datatype.boolean()
        ? faker.image.avatar()
        : null,

    email: faker.internet.email(),
    user_type: faker.helpers.arrayElement(["requester", "technician", "admin"]),

    first_name_en: faker.person.firstName(),
    first_name_ar: faker.helpers.arrayElement(arabicNames.first),

    mid_name_en: faker.person.firstName(),
    mid_name_ar: faker.helpers.arrayElement(arabicNames.first),

    last_name_en: faker.person.lastName(),
    last_name_ar: faker.helpers.arrayElement(arabicNames.last),

    ssn: faker.string.numeric(14),

    university: {
        id: faker.string.uuid(),
        name: faker.company.name(),
    },

    domain: {
        id: faker.string.uuid(),
        name: faker.helpers.arrayElement([
            "Engineering",
            "Medical",
            "Business",
            "Computer Science",
        ]),
    },

    departments: Array.from(
        { length: faker.number.int({ min: 1, max: 3 }) },
        () => ({
            id: faker.string.uuid(),
            name: faker.commerce.department(),
        })
    ),

    contacts: {
        phones: [
            faker.phone.number({ style: "international" }),
            faker.phone.number({ style: "international" }),
        ],
        mobiles: [
            faker.phone.number({style: "international"}),
        ],
    },

    status: faker.helpers.arrayElement(["active", "inactive"]),

    job_en: faker.person.jobTitle(),
    job_ar: faker.helpers.arrayElement(arabicNames.jobs),
});

export const usersMockList: User[] = Array.from(
    { length: 10 },
    generateUser
);
