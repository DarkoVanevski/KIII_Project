import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type InvoiceStatus } from '@/types';

const STATUS_STYLES: Record<InvoiceStatus, string> = {
    draft: 'bg-muted text-muted-foreground border-transparent',
    sent: 'bg-blue-100 text-blue-800 border-transparent dark:bg-blue-950 dark:text-blue-300',
    paid: 'bg-green-100 text-green-800 border-transparent dark:bg-green-950 dark:text-green-300',
    overdue: 'bg-red-100 text-red-800 border-transparent dark:bg-red-950 dark:text-red-300',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
};

export default function StatusBadge({ status, className }: { status: InvoiceStatus; className?: string }) {
    return <Badge className={cn(STATUS_STYLES[status], className)}>{STATUS_LABELS[status]}</Badge>;
}
