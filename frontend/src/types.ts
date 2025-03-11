export type Transaction = {
  _id: string;
  title: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  category: string;
};
