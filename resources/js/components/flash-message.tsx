import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash } = usePage<SharedData>().props;
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true);
        const timeout = setTimeout(() => setVisible(false), 4000);
        return () => clearTimeout(timeout);
    }, [flash.success, flash.error]);

    if (!visible || (!flash.success && !flash.error)) {
        return null;
    }

    const isError = Boolean(flash.error);

    return (
        <div
            className={
                'mx-4 mt-4 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ' +
                (isError
                    ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-300'
                    : 'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300')
            }
        >
            {isError ? <XCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
            {flash.error ?? flash.success}
        </div>
    );
}
