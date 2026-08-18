import Heading from '@/components/heading';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Invoice } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Invoices', href: '/invoices' }];

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Index({ invoices }: { invoices: Invoice[] }) {
    const destroy = (invoice: Invoice) => {
        if (confirm(`Delete invoice ${invoice.invoice_number}? This cannot be undone.`)) {
            router.delete(route('invoices.destroy', invoice.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Invoices" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Invoices" description="Create, send and track your invoices." />
                    <Button asChild>
                        <Link href={route('invoices.create')}>
                            <Plus /> New invoice
                        </Link>
                    </Button>
                </div>

                {invoices.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-8 text-center text-sm text-muted-foreground">
                        No invoices yet. Create your first invoice to get started.
                    </div>
                ) : (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due date</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">
                                            <Link href={route('invoices.show', invoice.id)} className="hover:underline">
                                                {invoice.invoice_number}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{invoice.client?.name ?? '—'}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={invoice.status} />
                                        </TableCell>
                                        <TableCell>{formatDate(invoice.due_date)}</TableCell>
                                        <TableCell className="text-right">{Number(invoice.total).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('invoices.show', invoice.id)}>
                                                        <Eye />
                                                    </Link>
                                                </Button>
                                                {invoice.status === 'draft' && (
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={route('invoices.edit', invoice.id)}>
                                                            <Pencil />
                                                        </Link>
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => destroy(invoice)}>
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
