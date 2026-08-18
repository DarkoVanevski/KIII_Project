import Heading from '@/components/heading';
import StatusBadge from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Invoice } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Pencil, Send, Trash2 } from 'lucide-react';

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function money(value: string | number): string {
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Show({ invoice }: { invoice: Invoice }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Invoices', href: '/invoices' },
        { title: invoice.invoice_number, href: `/invoices/${invoice.id}` },
    ];

    const send = () => {
        if (confirm(`Send invoice ${invoice.invoice_number} to ${invoice.client?.email ?? 'the client'}?`)) {
            router.post(route('invoices.send', invoice.id));
        }
    };

    const markPaid = () => {
        router.post(route('invoices.mark-paid', invoice.id));
    };

    const destroy = () => {
        if (confirm(`Delete invoice ${invoice.invoice_number}? This cannot be undone.`)) {
            router.delete(route('invoices.destroy', invoice.id), { onSuccess: () => router.visit(route('invoices.index')) });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={invoice.invoice_number} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Heading title={invoice.invoice_number} />
                        <StatusBadge status={invoice.status} className="mb-8" />
                    </div>
                    <div className="mb-8 flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <a href={route('invoices.pdf', invoice.id)} target="_blank" rel="noreferrer">
                                <Download /> Download PDF
                            </a>
                        </Button>
                        {invoice.status === 'draft' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={route('invoices.edit', invoice.id)}>
                                        <Pencil /> Edit
                                    </Link>
                                </Button>
                                <Button onClick={send}>
                                    <Send /> Send to client
                                </Button>
                            </>
                        )}
                        {invoice.status === 'sent' && <Button onClick={markPaid}>Mark as paid</Button>}
                        <Button variant="ghost" size="icon" onClick={destroy}>
                            <Trash2 />
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                        <div className="text-sm text-muted-foreground">Billed to</div>
                        <div className="font-medium">{invoice.client?.name}</div>
                        {invoice.client?.company && <div className="text-sm">{invoice.client.company}</div>}
                        {invoice.client?.email && <div className="text-sm">{invoice.client.email}</div>}
                        {invoice.client?.address && <div className="text-sm whitespace-pre-line">{invoice.client.address}</div>}
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Issue date</span>
                            <span>{formatDate(invoice.issue_date)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Due date</span>
                            <span>{formatDate(invoice.due_date)}</span>
                        </div>
                        {invoice.sent_at && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Sent</span>
                                <span>{formatDate(invoice.sent_at)}</span>
                            </div>
                        )}
                        {invoice.paid_at && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Paid</span>
                                <span>{formatDate(invoice.paid_at)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Unit price</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.items?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                                    <TableCell className="text-right">{money(item.unit_price)}</TableCell>
                                    <TableCell className="text-right">{money(item.amount)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="ml-auto grid w-64 gap-1 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{money(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Tax ({Number(invoice.tax_rate)}%)</span>
                        <span>{money(invoice.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 text-base font-semibold">
                        <span>Total</span>
                        <span>{money(invoice.total)}</span>
                    </div>
                </div>

                {invoice.notes && (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                        <div className="mb-1 text-sm text-muted-foreground">Notes</div>
                        <div className="text-sm whitespace-pre-line">{invoice.notes}</div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
