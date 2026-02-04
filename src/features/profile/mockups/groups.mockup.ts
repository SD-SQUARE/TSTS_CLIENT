import { faker } from "@faker-js/faker";
import type { GroupsResponse, Group } from "../interfaces/group.interface";

const tagColors = [
    "blue",
    "green",
    "purple",
    "gold",
    "red",
    "cyan",
    "magenta",
];

const generateGroup = (): Group => ({
    id: faker.string.uuid(),
    name: faker.commerce.department(),
    description: faker.lorem.sentence(),
    color: faker.helpers.arrayElement(tagColors),
});

const groups: Group[] = Array.from(
    { length: 12 },
    generateGroup
);

export const groupsMock: GroupsResponse = {
    data: groups,
    meta_data: {
        total: groups.length,
        page_index: 1,
        page_size: 10,
    },
};
