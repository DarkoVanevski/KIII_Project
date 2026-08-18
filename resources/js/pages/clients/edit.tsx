import ClientFormFields, { type ClientFormData } from '@/components/client-form-fields';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Client } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Edit({ client }: { client: Client }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Clients', href: '/clients' },
        { title: client.name, href: `/clients/${client.id}/edit` },
    ];

    const { data, setData, put, errors, processing } = useForm<ClientFormData>({
        name: client.name,
        company: client.company ?? '',
        email: client.email ?? '',
        phone: client.phone ?? '',
        address: client.address ?? '',
        notes: client.notes ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('clients.update', client.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${client.name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <form onSubmit={submit} className="max-w-xl space-y-6">
                    <ClientFormFields data={data} setData={setData} errors={errors} />

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save changes</Button>
                        <Link href={route('clients.index')} className="text-sm text-muted-foreground hover:underline">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
