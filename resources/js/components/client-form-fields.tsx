import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface ClientFormData {
    name: string;
    company: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    [key: string]: string;
}

export default function ClientFormFields({
    data,
    setData,
    errors,
}: {
    data: ClientFormData;
    setData: (key: keyof ClientFormData, value: string) => void;
    errors: Partial<Record<keyof ClientFormData, string>>;
}) {
    return (
        <div className="grid gap-6">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                <InputError message={errors.name} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" value={data.company} onChange={(e) => setData('company', e.target.value)} />
                <InputError message={errors.company} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    <InputError message={errors.email} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                    <InputError message={errors.phone} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} rows={3} />
                <InputError message={errors.address} />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3} />
                <InputError message={errors.notes} />
            </div>
        </div>
    );
}
