import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Client } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Clients', href: '/clients' }];

export default function Index({ clients }: { clients: Client[] }) {
    const destroy = (client: Client) => {
        if (confirm(`Delete ${client.name}? This cannot be undone.`)) {
            router.delete(route('clients.destroy', client.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Clients" description="People and companies you invoice." />
                    <Button asChild>
                        <Link href={route('clients.create')}>
                            <Plus /> New client
                        </Link>
                    </Button>
                </div>

                {clients.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-8 text-center text-sm text-muted-foreground">
                        No clients yet. Add your first client to start invoicing.
                    </div>
                ) : (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Invoices</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell className="font-medium">{client.name}</TableCell>
                                        <TableCell>{client.company ?? '—'}</TableCell>
                                        <TableCell>{client.email ?? '—'}</TableCell>
                                        <TableCell>{client.phone ?? '—'}</TableCell>
                                        <TableCell>{client.invoices_count ?? 0}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('clients.edit', client.id)}>
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => destroy(client)}>
                                                    <Trash2 />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
