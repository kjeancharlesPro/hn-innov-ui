interface Subject {
  id?: string;
  title: string;
  description: string;
  problem: string;
  innovation: string;
  _links?: {
    self?: {
      href: string;
    };
  };
}
interface Subjects {
  _embedded: {
    subjectEntities: Subject[];
  };
}
export type { Subject, Subjects };
