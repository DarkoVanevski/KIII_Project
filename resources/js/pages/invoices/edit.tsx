import InvoiceFormFields, { type InvoiceFormData } from '@/components/invoice-form-fields';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Client, type Invoice } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Edit({ invoice, clients }: { invoice: Invoice; clients: Client[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Invoices', href: '/invoices' },
        { title: invoice.invoice_number, href: `/invoices/${invoice.id}` },
        { title: 'Edit', href: `/invoices/${invoice.id}/edit` },
    ];

    const { data, setData, put, errors, processing } = useForm<InvoiceFormData>({
        client_id: String(invoice.client_id),
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        tax_rate: invoice.tax_rate,
        notes: invoice.notes ?? '',
        items: (invoice.items ?? []).map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
        })),
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('invoices.update', invoice.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${invoice.invoice_number}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <form onSubmit={submit} className="max-w-3xl space-y-6">
                    <InvoiceFormFields data={data} setData={setData} errors={errors} clients={clients} />

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save changes</Button>
                        <Link href={route('invoices.show', invoice.id)} className="text-sm text-muted-foreground hover:underline">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
