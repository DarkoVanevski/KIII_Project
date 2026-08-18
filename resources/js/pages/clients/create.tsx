import ClientFormFields, { type ClientFormData } from '@/components/client-form-fields';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Clients', href: '/clients' },
    { title: 'New client', href: '/clients/create' },
];

export default function Create() {
    const { data, setData, post, errors, processing } = useForm<ClientFormData>({
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('clients.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="New client" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <form onSubmit={submit} className="max-w-xl space-y-6">
                    <ClientFormFields data={data} setData={setData} errors={errors} />

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create client</Button>
                        <Link href={route('clients.index')} className="text-sm text-muted-foreground hover:underline">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
