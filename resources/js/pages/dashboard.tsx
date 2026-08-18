import StatusBadge from '@/components/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Invoice } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardStats {
    outstanding: number;
    paidThisMonth: number;
    clientCount: number;
    overdueCount: number;
}

function money(value: number): string {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value: string): string {
    return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Dashboard({ stats, recentInvoices }: { stats: DashboardStats; recentInvoices: Invoice[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{money(stats.outstanding)}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Paid this month</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{money(stats.paidThisMonth)}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{stats.clientCount}</CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue invoices</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{stats.overdueCount}</CardContent>
                    </Card>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 rounded-xl border">
                    <div className="flex items-center justify-between border-b p-4">
                        <h3 className="font-medium">Recent invoices</h3>
                        <Link href={route('invoices.index')} className="text-sm text-muted-foreground hover:underline">
                            View all
                        </Link>
                    </div>

                    {recentInvoices.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            No invoices yet.{' '}
                            <Link href={route('invoices.create')} className="underline">
                                Create your first invoice
                            </Link>
                            .
                        </div>
                    ) : (
                        <div className="divide-y">
                            {recentInvoices.map((invoice) => (
                                <Link
                                    key={invoice.id}
                                    href={route('invoices.show', invoice.id)}
                                    className="flex items-center justify-between p-4 hover:bg-muted/50"
                                >
                                    <div>
                                        <div className="font-medium">{invoice.invoice_number}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {invoice.client?.name} · {formatDate(invoice.issue_date)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{money(Number(invoice.total))}</span>
                                        <StatusBadge status={invoice.status} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
