
import { BaseCrudService } from "../../../api/common/services/common-services";
import type { KnowledgeBaseItem, CreateKnowledgeBaseDto, UpdateKnowledgeBaseDto } from "../types/knowledge-types";

// --- 1. Define Fake Data ---
const STATIC_KNOWLEDGE_DATA: KnowledgeBaseItem[] = [
  {
    id: 1,
    title: 'React Design Patterns',
    specialization: 'Frontend Development',
    description: 'A comprehensive guide to HOCs, Render Props, and Custom Hooks in React 18.',
    contentUrl: 'react-patterns.docx'
  },
  {
    id: 2,
    title: 'Spring Boot Security',
    specialization: 'Backend Engineering',
    description: 'Best practices for implementing JWT authentication and Role Based Access Control.',
    contentUrl: 'spring-security.pdf'
  },
  {
    id: 3,
    title: 'Docker Optimization',
    specialization: 'DevOps',
    description: 'Techniques for reducing image size and improving build times in CI/CD pipelines.',
    contentUrl: 'docker-guide.docx'
  },
  {
    id: 4,
    title: 'Figma to React Handoff',
    specialization: 'UI/UX Design',
    description: 'Standard operating procedures for designers handing off assets to developers.',
    contentUrl: 'handover-protocol.pdf'
  },
];

// --- 2. Create the Mock Service ---
// We explicitly type this to match what the component expects
export const knowledgeBaseApi = {
  getAll: async (): Promise<KnowledgeBaseItem[]> => {
    // Simulate network delay
    return new Promise((resolve) => setTimeout(() => resolve([...STATIC_KNOWLEDGE_DATA]), 500));
  },

  create: async (data: CreateKnowledgeBaseDto): Promise<KnowledgeBaseItem> => {
    return new Promise((resolve) => {
      const newItem = {
        ...data,
        id: Date.now(), // Fake ID
      } as KnowledgeBaseItem;
      
      STATIC_KNOWLEDGE_DATA.push(newItem);
      setTimeout(() => resolve(newItem), 500);
    });
  },

  update: async (id: string | number, data: UpdateKnowledgeBaseDto): Promise<KnowledgeBaseItem> => {
    return new Promise((resolve, reject) => {
      const index = STATIC_KNOWLEDGE_DATA.findIndex(item => item.id === id);
      
      if (index > -1) {
        const updated = { ...STATIC_KNOWLEDGE_DATA[index], ...data };
        STATIC_KNOWLEDGE_DATA[index] = updated;
        setTimeout(() => resolve(updated), 500);
      } else {
        reject(new Error("Item not found"));
      }
    });
  },

  delete: async (id: string | number): Promise<void> => {
    return new Promise((resolve) => {
      const index = STATIC_KNOWLEDGE_DATA.findIndex(item => item.id === id);
      if (index > -1) {
        STATIC_KNOWLEDGE_DATA.splice(index, 1);
      }
      setTimeout(() => resolve(), 500);
    });
  }
};













// import { BaseCrudService } from "../../../api/common/services/common-services";
// import type { KnowledgeBaseItem } from "../types/knowledge-types";

// export const knowledgeBaseApi = new BaseCrudService<KnowledgeBaseItem>(
//   "v1/knowledge-base",
//   "v1/knowledge-base/:id"
// );