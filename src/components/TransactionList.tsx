import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useLoadingStore, useErrorStore } from '../lib/store';

interface Transaction {
    id: number;
    amount: number;
    date: string;
    status: string;
    paymentMethod: string;
    pledgeTitle: string;
    username: string;
}

export const TransactionList = ({ pledgeId }: { pledgeId?: number }) => {
    const queryClient = useQueryClient();
    const setError = useErrorStore((state) => state.setError);

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions', pledgeId],
        queryFn: () => pledgeId ? transactionApi.getByPledge(pledgeId) : transactionApi.getAll(),
    });

    if (isLoading) {
        return <div>Loading transactions...</div>;
    }

    return (
        <div className="space-y-4">
            {transactions?.data?.map((transaction) => (
                <Card key={transaction.id}>
                    <CardHeader>
                        <CardTitle>
                            Transaction for {transaction.pledgeTitle}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-2">
                            <p>Amount:</p>
                            <p>${transaction.amount}</p>
                            <p>Date:</p>
                            <p>{new Date(transaction.date).toLocaleDateString()}</p>
                            <p>Status:</p>
                            <p>{transaction.status}</p>
                            <p>Payment Method:</p>
                            <p>{transaction.paymentMethod}</p>
                            <p>User:</p>
                            <p>{transaction.username}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};