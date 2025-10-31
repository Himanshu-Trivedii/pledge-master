export interface User {
    id: number;
    username: string;
    email: string;
    status: string;
}

export interface Pledge {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    deadline: string;
    status: string;
    amount: number;
    collectedAmount: number;
    userId: number;
    username: string;
}

export interface Transaction {
    id: number;
    amount: number;
    date: string;
    status: string;
    paymentMethod: string;
    pledgeId: number;
    pledgeTitle: string;
    userId: number;
    username: string;
}

export interface ApiResponse<T> {
    data: T;
    status: string;
    message: string;
}