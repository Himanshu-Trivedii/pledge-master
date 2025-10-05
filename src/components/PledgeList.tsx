import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pledgeApi } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useLoadingStore, useErrorStore } from '../lib/store';
import { Pledge, ApiResponse } from '../lib/types';

export const PledgeList = () => {
    const queryClient = useQueryClient();
    const setLoading = useLoadingStore((state) => state.setLoading);
    const setError = useErrorStore((state) => state.setError);

    const { data: pledges, isLoading } = useQuery({
        queryKey: ['pledges'],
        queryFn: pledgeApi.getAll,
    });

    const deletePledgeMutation = useMutation({
        mutationFn: pledgeApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pledges'] });
        },
        onError: (error: Error) => setError(error.message),
    });

    if (isLoading) {
        return <div>Loading pledges...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pledges?.data?.map((pledge) => (
                <Card key={pledge.id}>
                    <CardHeader>
                        <CardTitle>{pledge.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{pledge.description}</p>
                        <p>Goal: ${pledge.amount}</p>
                        <p>Collected: ${pledge.collectedAmount}</p>
                        <p>Status: {pledge.status}</p>
                        <div className="flex justify-end mt-4">
                            <Button 
                                variant="destructive"
                                onClick={() => deletePledgeMutation.mutate(pledge.id)}
                                disabled={deletePledgeMutation.isPending}
                            >
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};