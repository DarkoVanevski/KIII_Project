import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type Client } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

export interface InvoiceItemFormData {
    description: string;
    quantity: string;
    unit_price: string;
}

export interface InvoiceFormData {
    client_id: string;
    issue_date: string;
    due_date: string;
    tax_rate: string;
    notes: string;
    items: InvoiceItemFormData[];
}

type InvoiceFormErrors = Partial<Record<string, string>>;

function money(value: number): string {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type SetInvoiceData = <K extends keyof InvoiceFormData>(key: K, value: InvoiceFormData[K]) => void;

export default function InvoiceFormFields({
    data,
    setData,
    errors,
    clients,
}: {
    data: InvoiceFormData;
    setData: SetInvoiceData;
    errors: InvoiceFormErrors;
    clients: Client[];
}) {
    const updateItem = (index: number, field: keyof InvoiceItemFormData, value: string) => {
        const items = data.items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
        setData('items', items);
    };

    const addItem = () => {
        setData('items', [...data.items, { description: '', quantity: '1', unit_price: '0' }]);
    };

    const removeItem = (index: number) => {
        setData(
            'items',
            data.items.filter((_, i) => i !== index),
        );
    };

    const subtotal = data.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0), 0);
    const taxRate = parseFloat(data.tax_rate) || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return (
        <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="client_id">Client</Label>
                    <Select value={data.client_id} onValueChange={(value) => setData('client_id', value)}>
                        <SelectTrigger id="client_id">
                            <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                            {clients.map((client) => (
                                <SelectItem key={client.id} value={String(client.id)}>
                                    {client.name}
                                    {client.company ? ` (${client.company})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.client_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="tax_rate">Tax rate (%)</Label>
                    <Input
                        id="tax_rate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={data.tax_rate}
                        onChange={(e) => setData('tax_rate', e.target.value)}
                    />
                    <InputError message={errors.tax_rate} />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                    <Label htmlFor="issue_date">Issue date</Label>
                    <Input
                        id="issue_date"
                        type="date"
                        value={data.issue_date}
                        onChange={(e) => setData('issue_date', e.target.value)}
                    />
                    <InputError message={errors.issue_date} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="due_date">Due date</Label>
                    <Input id="due_date" type="date" value={data.due_date} onChange={(e) => setData('due_date', e.target.value)} />
                    <InputError message={errors.due_date} />
                </div>
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label>Line items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                        <Plus /> Add item
                    </Button>
                </div>
                <InputError message={errors.items} />

                <div className="border-sidebar-border/70 dark:border-sidebar-border overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="p-2 text-left font-medium text-muted-foreground">Description</th>
                                <th className="w-24 p-2 text-left font-medium text-muted-foreground">Qty</th>
                                <th className="w-32 p-2 text-left font-medium text-muted-foreground">Unit price</th>
                                <th className="w-32 p-2 text-right font-medium text-muted-foreground">Amount</th>
                                <th className="w-10 p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((item, index) => {
                                const amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);

                                return (
                                    <tr key={index} className="border-t">
                                        <td className="p-2">
                                            <Input
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                placeholder="Item description"
                                            />
                                            <InputError message={errors[`items.${index}.description`]} />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-2 text-right">{money(amount)}</td>
                                        <td className="p-2 text-right">
                                            {data.items.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                                                    <Trash2 />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="ml-auto grid w-64 gap-1 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>{money(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                        <span>Tax ({taxRate || 0}%)</span>
                        <span>{money(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 text-base font-semibold">
                        <span>Total</span>
                        <span>{money(total)}</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={3} />
                <InputError message={errors.notes} />
            </div>
        </div>
    );
}
