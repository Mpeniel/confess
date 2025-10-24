export type Campaign = {
    id: string;
    title: string;
    subtitle?: string;
    type: "Collective" | "Individual";
    participants: number;
    completion: number; // 0..100
    status: "Active" | "Inactive" | "Completed";
    goal: number;
    phrase?: string;
  };

export const MOCK: Campaign[] = [
    {
      id: "1",
      title: "Confession du matin",
      subtitle: "Renforcez votre foi avec des affirmations bibliques.",
      type: "Collective",
      participants: 150,
      completion: 50,
      status: "Active",
      goal: 1000,
      phrase: "Tous les hommes sont libres",
    },
    {
      id: "2",
      title: "Confession d'itentité",
      subtitle: "Déclarez la guérison sur votre vie et votre corps.",
      type: "Collective",
      participants: 200,
      completion: 90,
      status: "Active",
      goal: 100,
      phrase: "Je suis mort et ressuscité avec Christ",
    },
    {
      id: "3",
      title: "Confession - finances",
      subtitle: "Déclarez votre finances et vos revenus.",
      type: "Individual",
      participants: 100,
      completion: 50,
      status: "Inactive",
      goal: 100,
      phrase: "Je trouve des solutions aux problèmes des hommes",
    },
    {
      id: "4",
      title: "Confession - guérison",
      subtitle: "Déclarez la guérison sur votre vie et votre corps.",
      type: "Individual",
      participants: 50,
      completion: 25,
      status: "Inactive",
      goal: 150,
      phrase: "Je suis guéri",
    },
    {
      id: "5",
      title: "Confession - nature en Christ",
      subtitle: "Déclarez votre foi en matière de nature en Christ.",
      type: "Collective",
      participants: 300,
      completion: 80,
      status: "Active",
      goal: 1000,
      phrase: "Je suis la foi",
    },
  ];