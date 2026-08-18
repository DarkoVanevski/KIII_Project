import InvoiceFormFields, { type InvoiceFormData } from '@/components/invoice-form-fields';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Client } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Invoices', href: '/invoices' },
    { title: 'New invoice', href: '/invoices/create' },
];

export default function Create({ clients, nextInvoiceNumber }: { clients: Client[]; nextInvoiceNumber: string }) {
    const today = new Date().toISOString().slice(0, 10);
    const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data, setData, post, errors, processing } = useForm<InvoiceFormData>({
        client_id: '',
        issue_date: today,
        due_date: inTwoWeeks,
        tax_rate: '0',
        notes: '',
        items: [{ description: '', quantity: '1', unit_price: '0' }],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('invoices.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New invoice" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <form onSubmit={submit} className="max-w-3xl space-y-6">
                    <p className="text-sm text-muted-foreground">Invoice number {nextInvoiceNumber} will be assigned on save.</p>

                    <InvoiceFormFields data={data} setData={setData} errors={errors} clients={clients} />

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create invoice</Button>
                        <Link href={route('invoices.index')} className="text-sm text-muted-foreground hover:underline">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
